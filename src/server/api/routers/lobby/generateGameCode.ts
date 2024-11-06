import { GAME_CODE_LENGTH } from "./schemas";

export const generateGameCode = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  return Array.from({ length: GAME_CODE_LENGTH })
    .map(() => characters[Math.floor(Math.random() * characters.length)])
    .join("");
};
