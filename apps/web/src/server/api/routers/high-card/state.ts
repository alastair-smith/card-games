import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { protectedProcedure } from '~/server/api/trpc';
import { lobbySchema } from '~/server/data/lobby';
import { subscriber } from '~/server/events/connections';
import { subscribeToHighCardState } from '~/server/events/high-card';
import { getLobbyChannel, subscribeToLobbyState } from '~/server/events/lobby';
import { getGameState } from '~/server/state/game/high-card/get-game-state';
import { joinGame } from '~/server/state/game/high-card/join-game';
import {
  type GameCode,
  GameUpdate,
  gameCodeSchema,
  type Player,
} from '~/types/game';
import {
  GameStage,
  type GameState,
  gameStateSchema,
} from '~/types/games/high-card';
import { logger } from '~/utils/logger';

function getHighCardGameStateChannel(code: GameCode): `high-card:${GameCode}` {
  return `high-card:${code}`;
}

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
      state: GameState;
    };

export const state = protectedProcedure
  .input(
    z.object({
      code: gameCodeSchema,
    }),
  )
  .subscription(async function* ({
    input: { code },
    ctx: { userId },
  }): AsyncGenerator<StateSubscription> {
    const initialState = await getGameState(code, userId);

    if (!initialState) {
      return {
        update: GameUpdate.GAME_NOT_FOUND,
      };
    }

    switch (initialState.stage) {
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
        const exhaustiveCheck: never = initialState.stage;
        throw new Error(`Unexpected initial game stage: ${exhaustiveCheck}`);
      }
    }

    const messageQueue: StateSubscription[] = [];

    function handler(_pattern: string, channel: string, message: string) {
      if (channel === getLobbyChannel(code)) {
        const parsedMessage = JSON.parse(message);
        const messageData = lobbySchema.safeParse(parsedMessage);

        if (messageData.success) {
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
            new Error('Invalid message format for high card lobby', {
              cause: messageData.error,
            }),
          );
        }
      } else if (channel === getHighCardGameStateChannel(code)) {
        const parsedMessage = JSON.parse(message);
        const messageData = gameStateSchema.safeParse(parsedMessage);

        if (messageData.success) {
          messageQueue.push({
            update: GameUpdate.GAME_STATE_UPDATE,
            state: messageData.data,
          });
        } else {
          logger.error(
            new Error('Invalid message format for high card game', {
              cause: messageData.error,
            }),
          );
        }
      }
    }

    await subscribeToLobbyState();
    await subscribeToHighCardState();

    subscriber.on('pmessage', handler);

    try {
      while (true) {
        if (messageQueue.length > 0) {
          const message = messageQueue.shift();
          if (message) {
            yield message;
          }
        } else {
          await new Promise((resolve) => setTimeout(resolve, TICK_RATE_MS));
        }
      }
    } catch (error) {
      const subscriptionError = new TRPCError({
        message: 'Error in High Card subscription',
        code: 'INTERNAL_SERVER_ERROR',
        cause: error,
      });
      logger.error(subscriptionError);
      throw subscriptionError;
    } finally {
      subscriber.off('pmessage', handler);
      console.log('unsubscribed');
    }
  });
