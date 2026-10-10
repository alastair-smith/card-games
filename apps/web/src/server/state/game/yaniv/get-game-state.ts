import { getYanivState } from '~/server/data/yaniv';
import type { GameCode } from '~/types/game';
import type { GameState } from '~/types/games/yaniv';

export const getGameState = async (code: GameCode): Promise<GameState | null> =>
  getYanivState({ code });
