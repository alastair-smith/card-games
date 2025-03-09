import { GameCode } from "@/types/game";

export const GAME_CODE_LENGTH = 6;
const charSet = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';

const generateLobbyCode = (): GameCode => {
  return Array.from({ length: GAME_CODE_LENGTH }, () => charSet[Math.floor(Math.random() * charSet.length)]).join('') as GameCode;
}

export const createGame = async ({ host }: { host: string }) => {
  const code = generateLobbyCode();



  return { code };
}