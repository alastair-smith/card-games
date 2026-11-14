import { getLobby, type Lobby, setLobby } from '~/server/data/lobby';
import { publishLobbyState } from '~/server/events/lobby';
import { withLock } from '~/server/state/lib/locks';
import type { UserId } from '~/types/entities';
import { type GameCode, GameType, GameUpdate, type Player } from '~/types/game';
import { MAX_PLAYERS } from '~/types/games/shithead';
import { generatePlayerName } from '~/utils/name-generator';
import { getRandomPlayerColor } from '~/utils/player-color';

const enrichPlayerData = (
  players: Lobby['players'],
  host: UserId,
  userId: UserId,
): Player[] =>
  players.map((player) => ({
    ...player,
    isHost: player.id === host,
    isUser: player.id === userId,
  }));

export const joinGame = async ({
  code,
  userId,
}: {
  code: GameCode;
  userId: UserId;
}): Promise<
  | { update: GameUpdate.LOBBY_FULL | GameUpdate.GAME_NOT_FOUND }
  | { update: GameUpdate.LOBBY_UPDATE; players: Player[] }
> =>
  withLock('lobby', code, async () => {
    const lobby = await getLobby({ code });

    if (!lobby) {
      throw new Error('lobby not found');
    }

    if (lobby.type !== GameType.SHITHEAD) {
      throw new Error('not a Shithead lobby');
    }

    if (lobby.players.some(({ id }) => id === userId)) {
      return {
        update: GameUpdate.LOBBY_UPDATE,
        players: enrichPlayerData(lobby.players, lobby.host, userId),
      };
    }

    if (lobby.isGameStarted) {
      return { update: GameUpdate.GAME_NOT_FOUND };
    }

    if (lobby.players.length === MAX_PLAYERS) {
      return { update: GameUpdate.LOBBY_FULL };
    }

    const updatedLobby = await setLobby(
      { code },
      {
        ...lobby,
        players: [
          ...lobby.players,
          {
            id: userId,
            name: generatePlayerName(),
            color: getRandomPlayerColor(
              lobby.players.map(({ color }) => color),
            ),
            isReady: false,
          },
        ],
      },
    );

    await publishLobbyState(code, updatedLobby);

    return {
      update: GameUpdate.LOBBY_UPDATE,
      players: enrichPlayerData(
        updatedLobby.players,
        updatedLobby.host,
        userId,
      ),
    };
  });
