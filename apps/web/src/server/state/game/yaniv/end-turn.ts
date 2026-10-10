import { yanivDiscard } from '~/server/data/discard';
import { getYanivState, setYanivState } from '~/server/data/yaniv';
import { publishYanivState } from '~/server/events/yaniv';
import { withLock } from '~/server/state/lib/locks';
import type { UserId } from '~/types/entities';
import type { GameCode } from '~/types/game';
import { GameStage, GameStep } from '~/types/games/yaniv';
import { scoreYanivRound } from './lib/score-yaniv-round';

export const endTurn = async (code: GameCode, userId: UserId) =>
  withLock('yaniv', code, async () => {
    const state = await getYanivState({ code });
    if (!state) throw new Error('Game not found');

    if (state.gameStage !== GameStage.IN_PROGRESS)
      throw new Error('Game is not in progress');
    if (state.gameStep !== GameStep.PROCEED)
      throw new Error('Not the proceed step');
    if (state.currentPlayerId !== userId) throw new Error('Not your turn');

    const currentPlayer = state.players.find(({ id }) => id === userId);
    if (!currentPlayer) throw new Error('Player not found');
    if (currentPlayer.hand.length === 0)
      throw new Error('You must call Yaniv when you have no cards');

    const currentIndex = state.players.findIndex(({ id }) => id === userId);
    const nextIndex = (currentIndex + 1) % state.players.length;
    const nextPlayer = state.players[nextIndex];
    const nextPlayerId = nextPlayer?.id;

    if (!nextPlayerId) throw new Error('Next player not found');

    await yanivDiscard.pushDiscard(code, state.playedCards);

    if (nextPlayer.isYanivCalled) {
      await scoreYanivRound(code, state);
    } else {
      const newState = {
        ...state,
        playedCards: [],
        drawnCard: undefined,
        currentPlayerId: nextPlayerId,
        gameStep: GameStep.PLAY_CARDS,
      };

      await setYanivState({ code }, newState);
      await publishYanivState(code, newState);
    }
  });
