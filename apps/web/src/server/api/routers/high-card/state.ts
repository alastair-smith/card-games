import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { protectedProcedure } from '~/server/api/trpc';
import {
  getHighCardState,
  type GameState as HighCardGameState,
} from '~/server/data/high-card';
import { getLobbyPlayers, type Lobby, lobbySchema } from '~/server/data/lobby';
import { DataServiceError, DataServiceErrorCode } from '~/server/data/redis';
import { subscriber } from '~/server/events/connections';
import { getLobbyChannel, subscribeToLobbyState } from '~/server/events/lobby';
import { type GameState, joinGame } from '~/server/state/game/high-card';
import type { UserId } from '~/types/entities';
import {
  type GameCode,
  GameUpdate,
  gameCodeSchema,
  type Player,
} from '~/types/game';
import { GameStage, MAX_PLAYERS } from '~/types/games/high-card';

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

const addAdditionalPlayerFields = (
  players: Lobby['players'],
  userId: UserId,
  host: UserId,
): Player[] => {
  return players.map((player) => ({
    ...player,
    isUser: player.id === userId,
    isHost: player.id === host,
  }));
};

// TODO move this function elsewhere
function subscriptionKey(code: GameCode): `high-card:${GameCode}` {
  return `high-card:${code}`;
}

// should do multiple yields on joining a running game that you are already in (i.e. refreshing the page)

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
    const initialState = await getHighCardState({ code });

    if (!initialState) {
      return {
        update: GameUpdate.GAME_NOT_FOUND,
      };
    }

    switch (initialState.stage) {
      /** ====================================
       * TERMINATING STATUSES
       * ===================================== */
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
        const lobby = await getLobbyPlayers({ code });

        if (!lobby) {
          throw new TRPCError({
            message: `Lobby not found for code: ${code}`,
            code: 'INTERNAL_SERVER_ERROR',
          });
        }

        if (lobby.players.some(user => user.id === userId) {
          yield {
            update: GameUpdate.LOBBY_UPDATE,
            players: addAdditionalPlayerFields(lobby.players, userId, lobby.host),
          };
          break
        }
        if (lobby.players.length === MAX_PLAYERS) {
          return {
            update: GameUpdate.LOBBY_FULL,
          };
        }

        const { players, host } = await joinGame({
          code,
          userId,
        });
        yield {
          update: GameUpdate.LOBBY_UPDATE,
          players: addAdditionalPlayerFields(players, userId, host),
        };
        break;
      }

      case GamePlayerStatus.NO_ROOM_IN_LOBBY: {
        yield {
          update: GameUpdate.LOBBY_FULL,
        };
        return;
      }
      case GamePlayerStatus.USER_NOT_IN_GAME: {
        yield {
          update: GameUpdate.GAME_NOT_FOUND,
        };
        return;
      }

      /** ====================================
       * LOBBY STATUSES
       * ===================================== */
      case GamePlayerStatus.USER_IN_LOBBY: {
        const { players, host } = await getLobbyPlayers({ code });
        yield {
          update: GameUpdate.LOBBY_UPDATE,
          players: addAdditionalPlayerFields(players, userId, host),
        };
        break;
      }
      case GamePlayerStatus.USER_NOT_IN_LOBBY: {
        const { players, host } = await joinGame({
          code,
          userId,
        });
        yield {
          update: GameUpdate.LOBBY_UPDATE,
          players: addAdditionalPlayerFields(players, userId, host),
        };
        break;
      }

      /** ====================================
       * GAME STATUSES
       * ===================================== */
      case GamePlayerStatus.USER_IN_GAME: {
        yield {
          update: GameUpdate.GAME_STATE_UPDATE,
          state: initialState,
        };
        break;
      }
      default: {
        const exhaustiveCheck: never = gamePlayerStatus;
        throw new Error(`Unexpected game status: ${exhaustiveCheck}`);
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
          console.error('Invalid message format:', messageData.error);
        }
      } else if (channel === getHighCardGameStateChannel(code)) {
      }

      // if game event
    }

    await subscribeToLobbyState();

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
      console.error('Error in subscription:', error);
      throw new TRPCError({
        message: 'Error in subscription',
        code: 'INTERNAL_SERVER_ERROR',
        cause: error,
      });
    } finally {
      subscriber.off('pmessage', handler);
      console.log('unsubscribed');
    }
  });
