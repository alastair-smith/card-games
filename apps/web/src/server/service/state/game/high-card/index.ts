import { lobbyExists, setLobby } from "@/server/service/data/lobby";
import { type UserId } from "@/types/entities";
import { GAME_CODE_LENGTH, GameCode, GameType } from "@/types/game";

const charSet = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';

const randomChar = () => charSet[Math.floor(Math.random() * charSet.length)] as string;

const generateLobbyCode = (): GameCode => {
  return Array.from({ length: GAME_CODE_LENGTH }, randomChar).join('') as GameCode;
}

export const createGame = async ({ host }: { host: UserId }) => {
  const code = generateLobbyCode();

  if (await lobbyExists({ code })) {
    throw new Error('Error creating game: code already exists');
  }

  await setLobby({ code }, { code, type: GameType.HIGH_CARD, host });

  return { code };
}

void createGame({ host: 'd3d75dcc-1a59-413e-b361-70dfa5219872' as UserId })