import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { protectedProcedure } from '~/server/api/trpc';
import { lobbySchema } from '~/server/data/lobby';
import emitter from '~/server/events/emitter';
import { getEmojiChannel } from '~/server/events/emoji';
import { getLobbyChannel } from '~/server/events/lobby';
import { getYanivChannel } from '~/server/events/yaniv';
import type { ClientGameState } from '~/server/state/game/yaniv/get-game-state';
import { getGameState } from '~/server/state/game/yaniv/get-game-state';
import { joinGame } from '~/server/state/game/yaniv/join-game';
import type { UserId } from '~/types/entities';
import {
  type GameCode,
  GameUpdate,
  gameCodeSchema,
  type Player,
  type ReactionEmoji,
} from '~/types/game';
import { GameStage } from '~/types/games/yaniv';
import { logger } from '~/utils/logger';

const TICK_RATE_MS = 100;

type StateSubscription =
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
    }
  | {
      update: GameUpdate.GAME_STATE_UPDATE | GameUpdate.FINISHED;
      state: ClientGameState;
    }
  | {
      update: GameUpdate.EMOJI_REACTION;
      payload: { emoji: ReactionEmoji; targetPlayerId: UserId; id: number };
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
    const initialState = await getGameState(code, userId);

    if (!initialState) {
      return {
        update: GameUpdate.GAME_NOT_FOUND,
      };
    }

    switch (initialState.gameStage) {
      case GameStage.FINISHED: {
        if (initialState.players.some((user) => user.id === userId)) {
          return {
            update: GameUpdate.FINISHED,
            state: initialState,
          };
        }
        return {
          update: GameUpdate.GAME_NOT_FOUND,
        };
      }

      case GameStage.LOBBY: {
        const lobbyData = await joinGame({ code, userId });

        if (lobbyData.update === GameUpdate.LOBBY_FULL) {
          return {
            update: GameUpdate.LOBBY_FULL,
          };
        }

        yield {
          update: lobbyData.update,
          players: lobbyData.players,
        };

        break;
      }

      case GameStage.IN_PROGRESS: {
        yield {
          update: GameUpdate.GAME_STATE_UPDATE,
          state: initialState,
        };
        break;
      }

      default: {
        throw new Error(
          `Unexpected initial game stage: ${String(initialState.gameStage)}`,
        );
      }
    }

    const messageQueue: StateSubscription[] = [];

    function lobbyHandler(message: unknown) {
      const messageData = lobbySchema.safeParse(message);

      if (messageData.success) {
        if (!messageData.data.players.some((player) => player.id === userId)) {
          messageQueue.push({
            update: GameUpdate.KICKED,
          });
          return;
        }

        const players = messageData.data.players.map((player) => ({
          ...player,
          isHost: player.id === messageData.data.host,
          isUser: player.id === userId,
        }));
        messageQueue.push({
          update: GameUpdate.LOBBY_UPDATE,
          players,
        });
      } else {
        logger.error(
          new Error('Invalid message format for Yaniv lobby', {
            cause: messageData.error,
          }),
        );
      }
    }

    async function gameHandler(_message: unknown) {
      try {
        const clientState = await getGameState(code, userId);
        if (!clientState) return;

        const update =
          clientState.gameStage === GameStage.FINISHED
            ? GameUpdate.FINISHED
            : GameUpdate.GAME_STATE_UPDATE;
        messageQueue.push({
          update,
          state: clientState,
        });
      } catch (error) {
        logger.error(
          new Error('Error fetching Yaniv game state in subscription', {
            cause: error,
          }),
        );
      }
    }

    function emojiHandler(payload: {
      emoji: ReactionEmoji;
      targetPlayerId: UserId;
      id: number;
    }) {
      messageQueue.push({
        update: GameUpdate.EMOJI_REACTION,
        payload,
      });
    }

    const lobbyChannel = getLobbyChannel(code);
    const gameChannel = getYanivChannel(code);
    const emojiChannel = getEmojiChannel(code);

    emitter.on(lobbyChannel, lobbyHandler);
    emitter.on(gameChannel, gameHandler);
    emitter.on(emojiChannel, emojiHandler);

    try {
      while (!signal?.aborted) {
        if (messageQueue.length > 0) {
          const message = messageQueue.shift();
          if (message) {
            yield message;

            if (message.update === GameUpdate.FINISHED) {
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
