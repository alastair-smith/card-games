import type { GameCode } from '~/types/game';
import { type GameState, gameStateSchema } from '~/types/games/yaniv';
import emitter from './emitter';

export const getYanivChannel = (
  code: GameCode | '*',
): `yaniv:${GameCode | '*'}` => `yaniv:${code}`;

export const publishYanivState = async (code: GameCode, state: GameState) => {
  const validatedState = gameStateSchema.parse(state);
  emitter.emit(getYanivChannel(code), validatedState);
};
