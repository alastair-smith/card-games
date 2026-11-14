import {
  context as otelContext,
  propagation,
  type SpanContext,
  trace,
} from '@opentelemetry/api';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { protectedProcedure } from '~/server/api/trpc';
import { shitheadLobbySchema } from '~/server/data/lobby';
import { getShitheadState } from '~/server/data/shithead';
import emitter from '~/server/events/emitter';
import { getLobbyChannel } from '~/server/events/lobby';
import { joinGame } from '~/server/state/game/shithead/join-game';
import { setGameAttributes } from '~/telemetry/attributes';
import { GameUpdate, gameCodeSchema, type Player } from '~/types/game';
import { GameStage } from '~/types/games/shithead';
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
    };

type StateSubscription = StateSubscriptionData & {
  _trace?: string | undefined;
};

type QueuedMessage = {
  data: StateSubscriptionData;
  emitContext: SpanContext | undefined;
};

export const shitheadStateSubscription = protectedProcedure
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
      const messageData = shitheadLobbySchema.safeParse(message);

      if (!messageData.success) {
        logger.error(
          new Error('Invalid message format for Shithead lobby', {
            cause: messageData.error,
          }),
        );
        return;
      }

      if (!messageData.data.players.some((player) => player.id === userId)) {
        messageQueue.push({ data: { update: GameUpdate.KICKED }, emitContext });
        return;
      }

      const players = messageData.data.players.map((player) => ({
        ...player,
        isHost: player.id === messageData.data.host,
        isUser: player.id === userId,
      }));
      messageQueue.push({
        data: { update: GameUpdate.LOBBY_UPDATE, players },
        emitContext,
      });
    }

    const lobbyChannel = getLobbyChannel(code);

    emitter.on(lobbyChannel, lobbyHandler);

    try {
      const rawState = await getShitheadState({ code });

      if (!rawState) {
        yield { update: GameUpdate.GAME_NOT_FOUND };
        return;
      }

      if (rawState.gameStage !== GameStage.LOBBY) {
        throw new Error(`Unexpected initial game stage: ${rawState.gameStage}`);
      }

      const lobbyData = await joinGame({ code, userId });
      hasJoinedLobby = true;

      yield lobbyData;

      if (lobbyData.update !== GameUpdate.LOBBY_UPDATE) {
        return;
      }

      while (!signal?.aborted) {
        const queued = messageQueue.shift();
        if (!queued) {
          await new Promise((resolve) => setTimeout(resolve, TICK_RATE_MS));
          continue;
        }

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

          yield { ...data, _trace: carrier.traceparent };
        } finally {
          deliverSpan.end();
        }
      }
    } catch (error) {
      const subscriptionError = new TRPCError({
        message: 'Error in Shithead subscription',
        code: 'INTERNAL_SERVER_ERROR',
        cause: error,
      });
      logger.error(subscriptionError);
      throw subscriptionError;
    } finally {
      emitter.off(lobbyChannel, lobbyHandler);
    }
  });
