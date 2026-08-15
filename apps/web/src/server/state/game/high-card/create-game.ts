import { setHighCardState } from '~/server/data/high-card';
import { lobbyExists, setLobby } from '~/server/data/lobby';
import { generateLobbyCode } from '~/server/state/game/generate-lobby-code';
import { recordPlayerJoined } from '~/telemetry/metrics';
import type { UserId } from '~/types/entities';
import { GameType } from '~/types/game';
import { GameStage } from '~/types/games/high-card';
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
        type: GameType.HIGH_CARD,
        host,
        players: [
          {
            id: host,
            name: generatePlayerName(),
            color: getRandomPlayerColor(),
            isReady: false,
          },
        ],
      },
    ),
    setHighCardState(
      { code },
      { stage: GameStage.LOBBY, winners: [], players: [] },
    ),
  ]);

  // The host is placed straight into the lobby rather than going through
  // joinGame, so they need counting here or every game misses a player.
  recordPlayerJoined(GameType.HIGH_CARD);

  return { code };
};
