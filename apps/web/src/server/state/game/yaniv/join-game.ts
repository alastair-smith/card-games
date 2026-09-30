import { getLobby, type Lobby, setLobby } from '~/server/data/lobby';
import { withLobbyLock } from '~/server/data/lobby-lock';
import { publishLobbyState } from '~/server/events/lobby';
import type { UserId } from '~/types/entities';
import { type GameCode, GameType, GameUpdate, type Player } from '~/types/game';
import { MAX_PLAYERS, type Settings } from '~/types/games/yaniv';
import { generatePlayerName } from '~/utils/name-generator';
import { getRandomPlayerColor } from '~/utils/player-color';

const enrichPlayerData = (
  players: Lobby['players'],
  host: UserId,
  userId: UserId,
): Player[] => {
  return players.map((player) => {
    return {
      ...player,
      isHost: player.id === host,
      isUser: player.id === userId,
    };
  });
};

export const joinGame = ({
  code,
  userId,
}: {
  code: GameCode;
  userId: UserId;
}): Promise<
  | {
      update: GameUpdate.LOBBY_FULL;
    }
  | {
      update: GameUpdate.LOBBY_UPDATE;
      players: Player[];
      settings: Settings;
    }
> =>
  withLobbyLock(code, async () => {
    const lobby = await getLobby({ code });

    if (!lobby) {
      throw new Error('lobby not found');
    }

    if (lobby.type !== GameType.YANIV) {
      throw new Error('not a Yaniv lobby');
    }

    // already in game
    if (lobby.players.some(({ id }) => id === userId)) {
      return {
        update: GameUpdate.LOBBY_UPDATE,
        players: enrichPlayerData(lobby.players, lobby.host, userId),
        settings: lobby.settings,
      };
    }

    // full
    if (lobby.players.length === MAX_PLAYERS) {
      return { update: GameUpdate.LOBBY_FULL };
    }

    // else join

    const updatedPlayers = [
      ...lobby.players,
      {
        id: userId,
        name: generatePlayerName(),
        color: getRandomPlayerColor(lobby.players.map(({ color }) => color)),
        isReady: false,
      },
    ];

    const updatedLobby = await setLobby(
      { code },
      { ...lobby, players: updatedPlayers },
    );

    await publishLobbyState(code, updatedLobby);

    return {
      update: GameUpdate.LOBBY_UPDATE,
      players: enrichPlayerData(
        updatedLobby.players,
        updatedLobby.host,
        userId,
      ),
      settings: lobby.settings,
    };
  });
