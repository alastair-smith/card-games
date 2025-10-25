import { FALLBACK_PLAYER_NAME, PLAYER_NAMES } from './data';

export const generatePlayerName = () => {
  return (
    PLAYER_NAMES[Math.floor(Math.random() * PLAYER_NAMES.length)] ||
    FALLBACK_PLAYER_NAME
  );
};
