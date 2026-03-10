import { yanivDiscard } from '~/server/data/discard';
import { getYanivState, setYanivState } from '~/server/data/yaniv';
import { publishYanivState } from '~/server/events/yaniv';
import type { UserId } from '~/types/entities';
import type { GameCode } from '~/types/game';
import { GameStage, GameStep } from '~/types/games/yaniv';

export const endTurn = async (code: GameCode, userId: UserId) => {
  const state = await getYanivState({ code });
  if (!state) throw new Error('Game not found');

  if (state.gameStage !== GameStage.IN_PROGRESS)
    throw new Error('Game is not in progress');
  if (state.gameStep !== GameStep.PROCEED)
    throw new Error('Not the proceed step');
  if (state.currentPlayerId !== userId) throw new Error('Not your turn');

  const currentIndex = state.players.findIndex(({ id }) => id === userId);
  const nextIndex = (currentIndex + 1) % state.players.length;
  const nextPlayerId = state.players[nextIndex]?.id;

  if (!nextPlayerId) throw new Error('Next player not found');

  await yanivDiscard.pushDiscard(code, state.playedCards);

  const newState = {
    ...state,
    playedCards: [],
    drawnCard: undefined,
    currentPlayerId: nextPlayerId,
    gameStep: GameStep.PLAY_CARDS,
  };

  await setYanivState({ code }, newState);
  await publishYanivState(code, newState);
};
