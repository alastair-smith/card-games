import { getYanivState, setYanivState } from '~/server/data/yaniv';
import { publishYanivState } from '~/server/events/yaniv';
import { withLock } from '~/server/state/lib/locks';
import type { UserId } from '~/types/entities';
import type { GameCode } from '~/types/game';
import { GameStage, GameStep, type HandSize } from '~/types/games/yaniv';
import { dealRound } from './lib/deal-round';

export const chooseHandSize = async (
  code: GameCode,
  userId: UserId,
  handSize: HandSize,
) =>
  withLock('yaniv', code, async () => {
    const state = await getYanivState({ code });
    if (!state) throw new Error('Game not found');

    if (state.gameStage !== GameStage.IN_PROGRESS)
      throw new Error('Game is not in progress');
    if (state.gameStep !== GameStep.CHOOSE_HAND_SIZE)
      throw new Error('Not the choose hand size step');
    if (state.currentPlayerId !== userId) throw new Error('Not your turn');

    // A dealer choosing deals straight away; otherwise the dealer deals next
    const newState =
      state.dealerId === userId
        ? {
            ...state,
            handSize,
            players: await dealRound(code, state.players, handSize),
            playedCards: [],
            drawnCard: undefined,
            drawnFrom: null,
            gameStep: GameStep.PLAY_CARDS,
          }
        : {
            ...state,
            handSize,
            gameStep: GameStep.REDEAL,
            currentPlayerId: state.dealerId,
          };

    await setYanivState({ code }, newState);
    await publishYanivState(code, newState);
  });
