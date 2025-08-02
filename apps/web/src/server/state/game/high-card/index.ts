import { type Player } from "@/server/data/high-card";
import { getLobbyPlayers, lobbyExists, setLobbyPlayers, setLobbySummary } from "@/server/data/lobby";
import { publishLobbyState } from "@/server/events/lobby";
import { type UserId } from "@/types/entities";
import { GAME_CODE_LENGTH, type GameCode, GameType } from "@/types/game";
import { generatePlayerName } from "@/utils/name-generator";

const charSet = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';

const randomChar = () => charSet[Math.floor(Math.random() * charSet.length)]!;

const generateLobbyCode = (): GameCode => {
  return Array.from({ length: GAME_CODE_LENGTH }, randomChar).join('') as GameCode;
}

export const createGame = async ({ host }: { host: UserId }) => {
  const code = generateLobbyCode();

  if (await lobbyExists({ code })) {
    throw new Error('Error creating game: code already exists');
  }

  await setLobbySummary({ code }, { code, type: GameType.HIGH_CARD });
  await setLobbyPlayers({ code }, { code, host, players: [{ id: host, name: generatePlayerName(), isReady: false }] });

  return { code };
}

export const joinGame = async ({ code, userId }: { code: GameCode, userId: UserId }) => {
  const lobby = await getLobbyPlayers({ code });

  if (lobby.players.some(({ id }) => id === userId)) {
    return lobby;
  }

  const updatedPlayers = [...lobby.players, { id: userId, name: generatePlayerName(), isReady: false }];

  const updatedLobby = await setLobbyPlayers({ code }, { ...lobby, players: updatedPlayers });

  await publishLobbyState(code, updatedLobby);

  return updatedLobby;
}

export const updatePlayerState = async ({ code, userId, field, value }: { code: GameCode; userId: UserId; field: 'name'; value: string } | { code: GameCode; userId: UserId; field: 'isReady'; value: boolean }) => {
  const lobby = await getLobbyPlayers({ code });

  const playerInGame = lobby.players.some(({ id }) => id === userId);

  if (!playerInGame) {
    throw new Error('player not in game');
  }

  const updatedPlayers = lobby.players.map(player => player.id === userId ? { ...player, [field]: value } : player)

  const updatedLobby = await setLobbyPlayers({ code }, { ...lobby, players: updatedPlayers });

  await publishLobbyState(code, updatedLobby);

  return updatedLobby;
}

export type GamePlayer = Player & {
  isUser: boolean;
}

export type GameState = {
  players: GamePlayer[],
  winner: UserId | null,
};
