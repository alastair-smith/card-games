import {
  context as otelContext,
  propagation,
  type SpanContext,
  trace,
} from '@opentelemetry/api';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { protectedProcedure } from '~/server/api/trpc';
import { yanivDiscard } from '~/server/data/discard';
import { yanivLobbySchema } from '~/server/data/lobby';
import emitter from '~/server/events/emitter';
import { getEmojiChannel } from '~/server/events/emoji';
import { getLobbyChannel } from '~/server/events/lobby';
import { getYanivChannel } from '~/server/events/yaniv';
import type { ClientGameState } from '~/server/state/game/yaniv/get-game-state';
import {
  getGameState,
  toClientGameState,
} from '~/server/state/game/yaniv/get-game-state';
import { joinGame } from '~/server/state/game/yaniv/join-game';
import { setGameAttributes } from '~/telemetry/attributes';
import type { EmojiReactionId, UserId } from '~/types/entities';
import {
  GameUpdate,
  gameCodeSchema,
  type Player,
  type ReactionEmoji,
  type SystemEmoji,
} from '~/types/game';
import { GameStage, gameStateSchema, type Settings } from '~/types/games/yaniv';
import { logger } from '~/utils/logger';

const TICK_RATE_MS = 100;

const tracer = trace.getTracer('card-games-subscriptions');

type StateSubscriptionData =
  | {
      update:
        | GameUpdate.KICKED
        | GameUpdate.LEFT_GAME
        | GameUpdate.GAME_NOT_FOUND
        | GameUpdate.LOBBY_FULL;
    }
  | {
      update: GameUpdate.LOBBY_UPDATE;
      players: Player[];
      settings: Settings;
    }
  | {
      update: GameUpdate.GAME_STATE_UPDATE | GameUpdate.FINISHED;
      state: ClientGameState;
    }
  | {
      update: GameUpdate.EMOJI_REACTION;
      payload: {
        emoji: ReactionEmoji | SystemEmoji;
        targetPlayerId: UserId;
        id: EmojiReactionId;
      };
    };

type StateSubscription = StateSubscriptionData & { _trace?: string };

type QueuedMessage = {
  data: StateSubscriptionData;
  emitContext: SpanContext | undefined;
};

export const yanivStateSubscription = protectedProcedure
  .input(
    z.object({
      code: gameCodeSchema,
    }),
  )
  .subscription(async function* ({
    input: { code },
    ctx: { userId, signal },
  }): AsyncGenerator<StateSubscription> {
    const messageQueue: QueuedMessage[] = [];
    let hasJoinedLobby = false;

    function lobbyHandler(message: unknown) {
      if (!hasJoinedLobby) return;

      const emitContext = trace.getSpanContext(otelContext.active());
      const messageData = yanivLobbySchema.safeParse(message);

      if (messageData.success) {
        if (!messageData.data.players.some((player) => player.id === userId)) {
          messageQueue.push({
            data: { update: GameUpdate.KICKED },
            emitContext,
          });
          return;
        }

        const players = messageData.data.players.map((player) => ({
          ...player,
          isHost: player.id === messageData.data.host,
          isUser: player.id === userId,
        }));
        messageQueue.push({
          data: {
            update: GameUpdate.LOBBY_UPDATE,
            players,
            settings: messageData.data.settings,
          },
          emitContext,
        });
      } else {
        logger.error(
          new Error('Invalid message format for Yaniv lobby', {
            cause: messageData.error,
          }),
        );
      }
    }

    function gameHandler(message: unknown) {
      const emitContext = trace.getSpanContext(otelContext.active());
      const messageData = gameStateSchema.safeParse(message);

      if (messageData.success) {
        const emittedState = messageData.data;
        if (emittedState.gameStage === GameStage.LOBBY) return;

        const state = toClientGameState(emittedState, userId);
        const update =
          state.gameStage === GameStage.FINISHED
            ? GameUpdate.FINISHED
            : GameUpdate.GAME_STATE_UPDATE;
        messageQueue.push({ data: { update, state }, emitContext });
      } else {
        logger.error(
          new Error('Invalid message format for Yaniv game', {
            cause: messageData.error,
          }),
        );
      }
    }

    function emojiHandler(payload: {
      emoji: ReactionEmoji | SystemEmoji;
      targetPlayerId: UserId;
      id: EmojiReactionId;
    }) {
      const emitContext = trace.getSpanContext(otelContext.active());
      messageQueue.push({
        data: { update: GameUpdate.EMOJI_REACTION, payload },
        emitContext,
      });
    }

    const lobbyChannel = getLobbyChannel(code);
    const gameChannel = getYanivChannel(code);
    const emojiChannel = getEmojiChannel(code);

    emitter.on(lobbyChannel, lobbyHandler);
    emitter.on(gameChannel, gameHandler);
    emitter.on(emojiChannel, emojiHandler);

    try {
      const rawState = await getGameState(code);

      if (!rawState) {
        yield { update: GameUpdate.GAME_NOT_FOUND };
        return;
      }

      switch (rawState.gameStage) {
        case GameStage.FINISHED: {
          if (!rawState.players.some((player) => player.id === userId)) {
            yield { update: GameUpdate.GAME_NOT_FOUND };
            return;
          }
          yield {
            update: GameUpdate.FINISHED,
            state: toClientGameState(rawState, userId),
          };
          return;
        }

        case GameStage.LOBBY: {
          const lobbyData = await joinGame({ code, userId });
          hasJoinedLobby = true;

          if (lobbyData.update === GameUpdate.LOBBY_FULL) {
            yield { update: GameUpdate.LOBBY_FULL };
            return;
          }

          yield {
            update: lobbyData.update,
            players: lobbyData.players,
            settings: lobbyData.settings,
          };

          break;
        }

        case GameStage.IN_PROGRESS: {
          const topDiscardCard = await yanivDiscard.peekDiscard(code);
          yield {
            update: GameUpdate.GAME_STATE_UPDATE,
            state: toClientGameState({ ...rawState, topDiscardCard }, userId),
          };
          break;
        }

        default: {
          throw new Error(
            `Unexpected initial game stage: ${String((rawState as { gameStage: string }).gameStage)}`,
          );
        }
      }

      while (!signal?.aborted) {
        if (messageQueue.length > 0) {
          const queued = messageQueue.shift();
          if (queued) {
            const { data, emitContext } = queued;
            const deliverParentCtx = emitContext
              ? trace.setSpan(
                  otelContext.active(),
                  trace.wrapSpanContext(emitContext),
                )
              : otelContext.active();
            const deliverSpan = tracer.startSpan(
              'subscription.deliver',
              {},
              deliverParentCtx,
            );
            try {
              await setGameAttributes(deliverSpan, code, userId);
              const carrier: Record<string, string> = {};
              propagation.inject(
                trace.setSpan(otelContext.active(), deliverSpan),
                carrier,
              );

              yield {
                ...data,
                _trace: carrier.traceparent,
              } as StateSubscription;
            } finally {
              deliverSpan.end();
            }

            if (data.update === GameUpdate.FINISHED) {
              return;
            }
          }
        } else {
          await new Promise((resolve) => setTimeout(resolve, TICK_RATE_MS));
        }
      }
    } catch (error) {
      const subscriptionError = new TRPCError({
        message: 'Error in Yaniv subscription',
        code: 'INTERNAL_SERVER_ERROR',
        cause: error,
      });
      logger.error(subscriptionError);
      throw subscriptionError;
    } finally {
      emitter.off(lobbyChannel, lobbyHandler);
      emitter.off(gameChannel, gameHandler);
      emitter.off(emojiChannel, emojiHandler);
    }
  });
