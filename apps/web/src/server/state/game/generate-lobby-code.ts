import {
  GAME_CODE_CHARSET,
  GAME_CODE_LENGTH,
  type GameCode,
} from '~/types/game';

const randomChar = () => {
  const index = Math.floor(Math.random() * GAME_CODE_CHARSET.length);
  const char = GAME_CODE_CHARSET[index];
  if (char === undefined) {
    throw new Error('Failed to generate random character');
  }
  return char;
};

export const generateLobbyCode = (): GameCode => {
  return Array.from({ length: GAME_CODE_LENGTH }, randomChar).join(
    '',
  ) as GameCode;
};
