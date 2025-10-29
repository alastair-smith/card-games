import { setHighCardState } from '~/server/data/high-card';
import { lobbyExists, setLobby } from '~/server/data/lobby';
import type { UserId } from '~/types/entities';
import {
  GAME_CODE_CHARSET,
  GAME_CODE_LENGTH,
  type GameCode,
  GameType,
} from '~/types/game';
import { GameStage } from '~/types/games/high-card';
import { generatePlayerName } from '~/utils/name-generator';

const randomChar = () => {
  const index = Math.floor(Math.random() * GAME_CODE_CHARSET.length);
  const char = GAME_CODE_CHARSET[index];
  if (char === undefined) {
    throw new Error('Failed to generate random character');
  }
  return char;
};

const generateLobbyCode = (): GameCode => {
  return Array.from({ length: GAME_CODE_LENGTH }, randomChar).join(
    '',
  ) as GameCode;
};

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
        players: [{ id: host, name: generatePlayerName(), isReady: false }],
      },
    ),
    setHighCardState(
      { code },
      { stage: GameStage.LOBBY, winners: [], players: [] },
    ),
  ]);

  return { code };
};
