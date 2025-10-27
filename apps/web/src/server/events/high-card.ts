import type { z } from 'zod';
import { gameStateSchema } from '~/server/data/high-card';
import type { GameCode } from '~/types/game';
import emitter from './emitter';

export const getHighCardChannel = (
  code: GameCode | '*',
): `high-card:${GameCode | '*'}` => `high-card:${code}`;

export const publishHighCard = async (
  code: GameCode,
  state: z.infer<typeof gameStateSchema>,
) => {
  const validatedState = gameStateSchema.parse(state);

  emitter.emit(getHighCardChannel(code), validatedState);
};
