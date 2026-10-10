import { lobbyExists, setLobby } from '~/server/data/lobby';
import { setYanivState } from '~/server/data/yaniv';
import { generateLobbyCode } from '~/server/state/lib/generate-lobby-code';
import type { UserId } from '~/types/entities';
import { GameType } from '~/types/game';
import { DEFAULT_SETTINGS, GameStage } from '~/types/games/yaniv';
import { generatePlayerName } from '~/utils/name-generator';
import { getRandomPlayerColor } from '~/utils/player-color';

export const createGame = async ({ host }: { host: UserId }) => {
  const code = generateLobbyCode();

  if (await lobbyExists({ code })) {
    throw new Error('Error creating game: code already exists');
  }

  await Promise.all([
    setLobby(
      { code },
      {
        code,
        type: GameType.YANIV,
        host,
        settings: DEFAULT_SETTINGS,
        players: [
          {
            id: host,
            name: generatePlayerName(),
            color: getRandomPlayerColor(),
            isReady: false,
          },
        ],
        isGameStarted: false,
      },
    ),
    setYanivState({ code }, { gameStage: GameStage.LOBBY }),
  ]);

  return { code };
};
