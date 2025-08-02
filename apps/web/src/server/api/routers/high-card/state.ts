import { protectedProcedure } from "@/server/api/trpc";
import { getLobbyPlayers, Lobby, lobbySchema } from "@/server/data/lobby";
import { subscriber } from "@/server/events/connections";
import { getLobbyChannel, subscribeToLobbyState } from "@/server/events/lobby";
import { GameState, joinGame } from "@/server/state/game/high-card";
import { UserId } from "@/types/entities";
import { GameCode, gameCodeSchema, GameUpdate, Player } from "@/types/game";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

enum GameStatus {
  GAME_NOT_FOUND = 'GAME_NOT_FOUND',
  GAME_FINISHED_USER_NOT_IN_GAME = 'GAME_FINISHED_USER_NOT_IN_GAME',
  GAME_FINISHED_USER_IN_GAME = 'GAME_FINISHED_USER_IN_GAME',
  USER_IN_LOBBY = 'USER_IN_LOBBY',
  NO_ROOM_IN_LOBBY = 'NO_ROOM_IN_LOBBY',
  USER_NOT_IN_LOBBY = 'USER_NOT_IN_LOBBY',
  USER_IN_GAME = 'USER_IN_GAME',
  USER_NOT_IN_GAME = 'USER_NOT_IN_GAME',
}

function getHighCardGameStateChannel(code: GameCode): `high-card:${GameCode}` {
  return `high-card:${code}`;
}

const TICK_RATE_MS = 100;

type StateSubscription = {
  update:
  | GameUpdate.KICKED
  | GameUpdate.LEFT_GAME
  | GameUpdate.GAME_NOT_FOUND
  | GameUpdate.LOBBY_FULL;
} | {
  update: GameUpdate.LOBBY_UPDATE;
  players: Player[];
} | {
  update: GameUpdate.GAME_STATE_UPDATE | GameUpdate.FINISHED;
  state: GameState;
}

const getGameStatus = async (code: string, userId: string): Promise<GameStatus> => {
  return Promise.resolve(GameStatus.GAME_NOT_FOUND);
}

const addAdditionalPlayerFields = (players: Lobby['players'], userId: UserId, host: UserId): Player[] => {
  return players.map((player) => ({
    ...player,
    isUser: player.id === userId,
    isHost: player.id === host
  }));
};

// TODO move this function elsewhere
function subscriptionKey(code: GameCode): `high-card:${GameCode}` {
  return `high-card:${code}`;
}

// should do multiple yields on joining a running game that you are already in (i.e. refreshing the page)

export const state = protectedProcedure.input(z.object({
  code: gameCodeSchema
})).subscription(async function* ({ input: { code }, ctx: { userId } }): AsyncGenerator<StateSubscription> {
  const gameStatus = await getGameStatus(code, userId);

  switch (gameStatus) {
    /** ====================================
     * TERMINATING STATUSES
     * ===================================== */
    case GameStatus.GAME_NOT_FOUND: {
      yield {
        update: GameUpdate.GAME_NOT_FOUND
      }
      return;
    }
    case GameStatus.GAME_FINISHED_USER_NOT_IN_GAME: {
      yield {
        update: GameUpdate.GAME_NOT_FOUND
      }
      return;
    }
    case GameStatus.GAME_FINISHED_USER_IN_GAME: {
      const gameState = await getGameState(code, userId)

      yield {
        update: GameUpdate.FINISHED,
        state: gameState
      }
      return;
    }
    case GameStatus.NO_ROOM_IN_LOBBY: {
      yield {
        update: GameUpdate.LOBBY_FULL
      }
      return;
    }
    case GameStatus.USER_NOT_IN_GAME: {
      const x = gameStatus;
      yield {
        update: GameUpdate.GAME_NOT_FOUND,
      }
      return;
    }

    /** ====================================
     * LOBBY STATUSES
     * ===================================== */
    case GameStatus.USER_IN_LOBBY: {
      const { players, host } = await getLobbyPlayers({ code });
      yield {
        update: GameUpdate.LOBBY_UPDATE,
        players: addAdditionalPlayerFields(players, userId, host)
      }
      break;
    }
    case GameStatus.USER_NOT_IN_LOBBY: {
      const { players, host } = await joinGame({
        code,
        userId
      });
      yield {
        update: GameUpdate.LOBBY_UPDATE,
        players: addAdditionalPlayerFields(players, userId, host)
      }
      break;
    }

    /** ====================================
     * GAME STATUSES
     * ===================================== */
    case GameStatus.USER_IN_GAME: {
      const gameState = await getGameState(code, userId);

      yield {
        update: GameUpdate.GAME_STATE_UPDATE,
        state: gameState
      }
      break;
    }
    default: {
      const exhaustiveCheck: never = gameStatus;
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
          isUser: player.id === userId
        }));
        messageQueue.push({
          update: GameUpdate.LOBBY_UPDATE,
          players
        });
      } else {
        console.error('Invalid message format:', messageData.error);
      }
    } else if (channel === getHighCardGameStateChannel(code)) {

    }

    // if game event
  }

  await subscribeToLobbyState();

  subscriber.on('pmessage', handler)

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
      cause: error
    });
  }
  finally {
    subscriber.off('pmessage', handler);
    console.log('unsubscribed')
  }
})