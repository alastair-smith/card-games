import type { GameCode } from '~/types/game';
import { gameStateSchema } from '~/types/games/shithead';
import { dataLayer } from './redis';

export const {
  get: getShitheadState,
  set: setShitheadState,
  exists: shitheadStateExists,
  delete: deleteShitheadState,
} = dataLayer(
  ({ code }: { code: GameCode }) => `shithead:${code}`,
  gameStateSchema,
);
