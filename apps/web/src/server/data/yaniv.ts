import type { GameCode } from '~/types/game';
import { gameStateSchema } from '~/types/games/yaniv';
import { dataLayer } from './redis';

export const {
  get: getYanivState,
  set: setYanivState,
  exists: yanivStateExists,
  delete: deleteYanivState,
} = dataLayer(
  ({ code }: { code: GameCode }) => `yaniv:${code}`,
  gameStateSchema,
);
