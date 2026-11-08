import type { UserId } from '~/types/entities';

/** The next player in the lobby's order, wrapping round. */
export const getPlayerAfter = <Player extends { id: UserId }>(
  players: Player[],
  playerId: UserId,
): Player => {
  const index = players.findIndex(({ id }) => id === playerId);
  if (index === -1) throw new Error('Player not found');
  const nextPlayer = players[(index + 1) % players.length];
  if (!nextPlayer) throw new Error('Next player not found');
  return nextPlayer;
};
