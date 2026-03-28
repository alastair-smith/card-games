import { yanivDeck } from '~/server/data/deck';
import { yanivDiscard } from '~/server/data/discard';
import { getYanivState, setYanivState } from '~/server/data/yaniv';
import { publishYanivState } from '~/server/events/yaniv';
import { deckWithJokers } from '~/types/cards';
import type { UserId } from '~/types/entities';
import type { GameCode } from '~/types/game';
import { GameStage, GameStep, HAND_SIZE } from '~/types/games/yaniv';
import { shuffle } from '~/utils/cards/index';

export const startNewRound = async (code: GameCode, userId: UserId) => {
  const state = await getYanivState({ code });
  if (!state) throw new Error('Game not found');

  if (state.gameStage !== GameStage.IN_PROGRESS)
    throw new Error('Game is not in progress');
  if (state.gameStep !== GameStep.REDEAL)
    throw new Error('Not the redeal step');
  if (state.currentPlayerId !== userId) throw new Error('Not your turn');

  await yanivDeck.createDeck(code, shuffle([...deckWithJokers]));

  const players = [];
  for (const existing of state.players) {
    const cards = await yanivDeck.drawCards(code, HAND_SIZE);
    players.push({
      ...existing,
      isYanivCalled: false,
      cardCount: cards.length,
      hand: cards,
      roundScore: { original: 0, adjusted: 0 },
    });
  }

  await yanivDiscard.createDiscard(code);
  const firstDiscard = await yanivDeck.drawCard(code);
  if (!firstDiscard) throw new Error('Deck ran out of cards seeding discard');
  await yanivDiscard.pushDiscard(code, firstDiscard);

  const newState = {
    ...state,
    players,
    playedCards: [],
    drawnCard: undefined,
    currentPlayerId: state.currentPlayerId,
    gameStep: GameStep.PLAY_CARDS,
  };

  await setYanivState({ code }, newState);
  await publishYanivState(code, newState);
};
