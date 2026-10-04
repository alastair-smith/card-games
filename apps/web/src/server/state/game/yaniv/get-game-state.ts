import { getYanivState } from '~/server/data/yaniv';
import { withLock } from '~/server/state/lib/locks';
import type { GameCode } from '~/types/game';
import type { GameState } from '~/types/games/yaniv';

export const getGameState = async (code: GameCode): Promise<GameState | null> =>
  withLock('yaniv', code, async () => getYanivState({ code }));
