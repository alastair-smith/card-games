import type { z } from 'zod';
import type { GameCode } from '~/types/game';
import { gameStateSchema } from '~/types/games/yaniv';
import emitter from './emitter';

export const getYanivChannel = (
  code: GameCode | '*',
): `yaniv:${GameCode | '*'}` => `yaniv:${code}`;

export const publishYanivState = async (
  code: GameCode,
  state: z.infer<typeof gameStateSchema>,
) => {
  const validatedState = gameStateSchema.parse(state);
  emitter.emit(getYanivChannel(code), validatedState);
};
