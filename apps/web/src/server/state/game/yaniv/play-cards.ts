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
import { isValidYanivPlay } from '~/utils/yaniv/validation';

export const playCards = async (
  code: GameCode,
  userId: UserId,
  cards: YanivPlayingCard[],
) => {
  const state = await getYanivState({ code });
  if (!state) throw new Error('Game not found');

  if (state.gameStage !== GameStage.IN_PROGRESS)
    throw new Error('Game is not in progress');

  const isProceedStep = state.gameStep === GameStep.PROCEED;
  if (!isProceedStep && state.gameStep !== GameStep.PLAY_CARDS)
    throw new Error('Not the play cards step');

  if (state.currentPlayerId !== userId) throw new Error('Not your turn');

  const hand = state.hands[userId];
  if (!hand) throw new Error('Hand not found');

  if (isProceedStep) {
    if (!state.drawnCard) throw new Error('No drawn card to play back');
    const matchesDrawn =
      cards.length === 1 &&
      cards[0]?.rank === state.drawnCard.rank &&
      cards[0]?.suit === state.drawnCard.suit;
    if (!matchesDrawn) throw new Error('Can only play back the drawn card');
  }

  const remainingHand = [...hand];
  // remove played cards from hand, verifying if they were in there as we go
  for (const card of cards) {
    const cardIndex = remainingHand.findIndex(
      (handCard) => handCard.rank === card.rank && handCard.suit === card.suit,
    );
    if (cardIndex === -1) throw new Error('Card not in hand');
    remainingHand.splice(cardIndex, 1);
  }

  const topDiscard = await yanivDiscard.peekDiscard(code);
  if (!topDiscard) throw new Error('Discard pile is empty');
  const playResult = isValidYanivPlay(cards, topDiscard);
  if (!playResult.isValid) throw new Error('Invalid card combination');

  const updatedPlayers = state.players.map((player) =>
    player.id === userId
      ? { ...player, cardCount: remainingHand.length }
      : player,
  );

  const nextGameStep =
    isProceedStep || !playResult.isPickupRequired
      ? GameStep.PROCEED
      : GameStep.PICKUP_CARD;

  const newState = {
    ...state,
    players: updatedPlayers,
    hands: { ...state.hands, [userId]: remainingHand },
    playedCards: playResult.orderedCards,
    gameStep: nextGameStep,
    ...(isProceedStep && { drawnCard: undefined }),
  };

  await setYanivState({ code }, newState);
  await publishYanivState(code, newState);
};
