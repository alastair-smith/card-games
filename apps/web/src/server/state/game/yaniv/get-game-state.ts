import { getYanivState } from '~/server/data/yaniv';
import type { GameCode } from '~/types/game';
import type { GameState } from '~/types/games/yaniv';

export type { ClientGameState } from './to-client-game-state';
export { toClientGameState } from './to-client-game-state';

export const getGameState = async (
  code: GameCode,
): Promise<GameState | null> => {
  return getYanivState({ code });
};
