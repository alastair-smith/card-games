import { getYanivState, setYanivState } from '~/server/data/yaniv';
import { publishYanivState } from '~/server/events/yaniv';
import { withLock } from '~/server/state/lib/locks';
import type { UserId } from '~/types/entities';
import type { GameCode } from '~/types/game';
import { GameStage, GameStep, RANDOM_HAND_SIZE } from '~/types/games/yaniv';
import { dealNextRound } from './lib/deal-round';
import { pickRandomHandSize } from './lib/pick-random-hand-size';

export const startNewRound = async (code: GameCode, userId: UserId) =>
  withLock('yaniv', code, async () => {
    const state = await getYanivState({ code });
    if (!state) throw new Error('Game not found');

    if (state.gameStage !== GameStage.IN_PROGRESS)
      throw new Error('Game is not in progress');
    if (state.gameStep !== GameStep.REDEAL)
      throw new Error('Not the redeal step');
    if (state.currentPlayerId !== userId) throw new Error('Not your turn');
    const handSize =
      state.settings.handSize === RANDOM_HAND_SIZE
        ? pickRandomHandSize(state.settings.handSizeRange)
        : state.handSize;
    if (handSize === null) throw new Error('Hand size not chosen');

    const newState = await dealNextRound(code, state, handSize);

    await setYanivState({ code }, newState);
    await publishYanivState(code, newState);
  });
