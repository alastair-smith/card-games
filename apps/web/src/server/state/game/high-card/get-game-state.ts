import { getHighCardState } from '~/server/data/high-card';
import type { UserId } from '~/types/entities';
import type { GameCode } from '~/types/game';
import type { GameState } from '~/types/games/high-card';

export const getGameState = async (
  code: GameCode,
  userId: UserId,
): Promise<GameState | null> => {
  const rawState = await getHighCardState({ code });

  if (!rawState) {
    return null;
  }

  const gamePlayers = rawState.players.map((player) => {
    return {
      ...player,
      isUser: player.id === userId,
    };
  });

  return {
    winners: rawState.winners,
    players: gamePlayers,
    stage: rawState.stage,
  };
};
