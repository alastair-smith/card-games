import { getLobby, setLobby } from '~/server/data/lobby';
import { publishLobbyState } from '~/server/events/lobby';
import { withLock } from '~/server/state/lib/locks';
import type { UserId } from '~/types/entities';
import { type GameCode, GameType } from '~/types/game';
import type { Settings } from '~/types/games/yaniv';

export const updateSettings = async ({
  code,
  userId,
  settings,
}: {
  code: GameCode;
  userId: UserId;
  settings: Settings;
}) =>
  withLock('lobby', code, async () => {
    const lobby = await getLobby({ code });

    if (!lobby) {
      throw new Error('lobby not found');
    }

    if (lobby.type !== GameType.YANIV) {
      throw new Error('not a Yaniv lobby');
    }

    if (lobby.isGameStarted) {
      throw new Error('game has already started');
    }

    if (lobby.host !== userId) {
      throw new Error('only the host can change the settings');
    }

    const updatedLobby = await setLobby({ code }, { ...lobby, settings });

    await publishLobbyState(code, updatedLobby);

    return updatedLobby;
  });
