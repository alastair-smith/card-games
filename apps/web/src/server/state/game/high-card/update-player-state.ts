import { getLobby, setLobby } from '~/server/data/lobby';
import { publishLobbyState } from '~/server/events/lobby';
import type { UserId } from '~/types/entities';
import type { GameCode } from '~/types/game';

export const updatePlayerState = async ({
  code,
  userId,
  field,
  value,
}:
  | { code: GameCode; userId: UserId; field: 'name'; value: string }
  | { code: GameCode; userId: UserId; field: 'isReady'; value: boolean }) => {
  const lobby = await getLobby({ code });

  if (!lobby) {
    throw new Error('lobby not found');
  }

  if (!lobby.players.some(({ id }) => id === userId)) {
    throw new Error('player not in game');
  }

  const updatedPlayers = lobby.players.map((player) =>
    player.id === userId ? { ...player, [field]: value } : player,
  );

  const updatedLobby = await setLobby(
    { code },
    { ...lobby, players: updatedPlayers },
  );

  await publishLobbyState(code, updatedLobby);

  return updatedLobby;
};
