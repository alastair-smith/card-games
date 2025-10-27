import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { protectedProcedure } from '~/server/api/trpc';
import { gameStateSchema as gameStateRawDataSchema } from '~/server/data/high-card';
import { lobbySchema } from '~/server/data/lobby';
import emitter from '~/server/events/emitter';
import { getLobbyChannel } from '~/server/events/lobby';
import { getGameState } from '~/server/state/game/high-card/get-game-state';
import { joinGame } from '~/server/state/game/high-card/join-game';
import {
  type GameCode,
  GameUpdate,
  gameCodeSchema,
  type Player,
} from '~/types/game';
import { GameStage, type GameState } from '~/types/games/high-card';
import { logger } from '~/utils/logger';

type RawGameState = z.infer<typeof gameStateRawDataSchema>;

function toClientGameState(rawState: RawGameState, userId: string): GameState {
  return {
    ...rawState,
    players: rawState.players.map((player) => ({
      ...player,
      isUser: player.id === userId,
    })),
  };
}

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

    function lobbyHandler(message: unknown) {
      const messageData = lobbySchema.safeParse(message);

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
    }

    function gameHandler(message: unknown) {
      const messageData = gameStateRawDataSchema.safeParse(message);

      if (messageData.success) {
        messageQueue.push({
          update: GameUpdate.GAME_STATE_UPDATE,
          state: toClientGameState(messageData.data, userId),
        });
      } else {
        logger.error(
          new Error('Invalid message format for high card game', {
            cause: messageData.error,
          }),
        );
      }
    }

    const lobbyChannel = getLobbyChannel(code);
    const gameChannel = getHighCardGameStateChannel(code);

    emitter.on(lobbyChannel, lobbyHandler);
    emitter.on(gameChannel, gameHandler);

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
      emitter.off(lobbyChannel, lobbyHandler);
      emitter.off(gameChannel, gameHandler);
    }
  });
