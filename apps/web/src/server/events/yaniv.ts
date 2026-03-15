import { yanivDiscard } from '~/server/data/discard';
import type { GameCode } from '~/types/game';
import {
  GameStage,
  type GameState,
  gameStateSchema,
} from '~/types/games/yaniv';
import emitter from './emitter';

export const getYanivChannel = (
  code: GameCode | '*',
): `yaniv:${GameCode | '*'}` => `yaniv:${code}`;

export const publishYanivState = async (code: GameCode, state: GameState) => {
  const validatedState = gameStateSchema.parse(state);

  if (validatedState.gameStage === GameStage.IN_PROGRESS) {
    const topDiscardCard = await yanivDiscard.peekDiscard(code);
    emitter.emit(getYanivChannel(code), { ...validatedState, topDiscardCard });
  } else {
    emitter.emit(getYanivChannel(code), validatedState);
  }
};
