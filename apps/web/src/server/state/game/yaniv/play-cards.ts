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
  if (state.gameStep !== GameStep.PLAY_CARDS)
    throw new Error('Not the play cards step');
  if (state.currentPlayerId !== userId) throw new Error('Not your turn');

  const hand = state.hands[userId];
  if (!hand) throw new Error('Hand not found');
  const remainingHand = [...hand];
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

  await yanivDiscard.pushDiscard(code, playResult.orderedCards);

  const nextGameStep = playResult.isPickupRequired
    ? GameStep.PICKUP_CARD
    : GameStep.PROCEED;

  const newState = {
    ...state,
    players: updatedPlayers,
    hands: { ...state.hands, [userId]: remainingHand },
    playedCards: playResult.orderedCards,
    gameStep: nextGameStep,
  };

  await setYanivState({ code }, newState);
  await publishYanivState(code, newState);
};
