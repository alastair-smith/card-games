import { yanivDeck } from '~/server/data/deck';
import { yanivDiscard } from '~/server/data/discard';
import { getYanivState, setYanivState } from '~/server/data/yaniv';
import { publishYanivState } from '~/server/events/yaniv';
import type { UserId } from '~/types/entities';
import type { GameCode } from '~/types/game';
import {
  GameStage,
  GameStep,
  type YanivPlayingCard,
} from '~/types/games/yaniv';
import { shuffle } from '~/utils/cards';

const drawFromDeck = async (code: GameCode): Promise<YanivPlayingCard> => {
  const deckSize = await yanivDeck.getDeckSize(code);
  if (deckSize === 0) {
    const [topCard, ...cardsToShuffle] = await yanivDiscard.drainDiscard(code);
    await yanivDeck.createDeck(code, shuffle(cardsToShuffle));
    if (topCard) await yanivDiscard.pushDiscard(code, topCard);
  }
  const card = await yanivDeck.drawCard(code);
  if (!card) throw new Error('Deck is empty despite shuffle');
  return card;
};

const drawFromDiscard = async (code: GameCode): Promise<YanivPlayingCard> => {
  const card = await yanivDiscard.popDiscard(code);
  if (!card) throw new Error('Discard pile is empty');
  return card;
};

export const pickupCard = async (
  code: GameCode,
  userId: UserId,
  source: 'deck' | 'discard',
) => {
  const state = await getYanivState({ code });
  if (!state) throw new Error('Game not found');

  if (state.gameStage !== GameStage.IN_PROGRESS)
    throw new Error('Game is not in progress');
  if (state.gameStep !== GameStep.PICKUP_CARD)
    throw new Error('Not the pickup card step');
  if (state.currentPlayerId !== userId) throw new Error('Not your turn');
  if (!state.hands[userId]) throw new Error('Not got a hand in the game');

  const drawnCard =
    source === 'deck' ? await drawFromDeck(code) : await drawFromDiscard(code);

  const updatedHand = [...state.hands[userId], drawnCard];

  const updatedPlayers = state.players.map((player) =>
    player.id === userId
      ? { ...player, cardCount: updatedHand.length }
      : player,
  );

  const newState = {
    ...state,
    players: updatedPlayers,
    hands: { ...state.hands, [userId]: updatedHand },
    gameStep: GameStep.PROCEED,
    drawnCard,
    ...(source === 'discard' && { playedCards: [] }),
  };

  await setYanivState({ code }, newState);
  await publishYanivState(code, newState);
};
