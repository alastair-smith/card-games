import { getLobbyPlayers, lobbyExists, setLobbyPlayers, setLobbySummary } from "@/server/service/data/lobby";
import { type UserId } from "@/types/entities";
import { GAME_CODE_LENGTH, GameCode, GameType } from "@/types/game";
import { generatePlayerName } from "@/utils/name-generator";

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

  await setLobbySummary({ code }, { code, type: GameType.HIGH_CARD });
  await setLobbyPlayers({ code }, { host, players: [{ id: host, name: generatePlayerName(), ready: false }] });

  return { code };
}

export const joinGame = async ({ code, userId }: { code: GameCode, userId: UserId }) => {
  const lobby = await getLobbyPlayers({ code });

  if (lobby.players.some(({ id }) => id === userId)) {
    return lobby;
  }

  const updatedPlayers = [...lobby.players, { id: userId, name: generatePlayerName(), ready: false }];

  const updatedLobby = await setLobbyPlayers({ code }, { ...lobby, players: updatedPlayers });

  return updatedLobby;
}
