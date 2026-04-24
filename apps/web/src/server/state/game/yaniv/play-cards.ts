import { yanivDiscard } from '~/server/data/discard';
import { getYanivState, setYanivState } from '~/server/data/yaniv';
import { publishEmoji } from '~/server/events/emoji';
import { publishYanivState } from '~/server/events/yaniv';
import type { UserId } from '~/types/entities';
import type { GameCode } from '~/types/game';
import {
  GameStage,
  type GameState,
  GameStep,
  type YanivPlayingCard,
} from '~/types/games/yaniv';
import { isValidYanivPlay } from '~/utils/yaniv/validation';

type InProgressState = Extract<GameState, { gameStage: GameStage.IN_PROGRESS }>;

const removeFromHand = (
  hand: YanivPlayingCard[],
  cards: YanivPlayingCard[],
): YanivPlayingCard[] => {
  const remaining = [...hand];
  for (const card of cards) {
    const positionInHand = remaining.findIndex(
      ({ rank, suit }) => rank === card.rank && suit === card.suit,
    );
    if (positionInHand === -1) throw new Error('Card not in hand');
    remaining.splice(positionInHand, 1);
  }
  return remaining;
};

const updatePlayerHand = (
  state: InProgressState,
  userId: UserId,
  newHand: YanivPlayingCard[],
) =>
  state.players.map((player) =>
    player.id === userId
      ? { ...player, hand: newHand, cardCount: newHand.length }
      : player,
  );

const playCardsOnTurn = async (
  code: GameCode,
  state: InProgressState,
  userId: UserId,
  hand: YanivPlayingCard[],
  cards: YanivPlayingCard[],
): Promise<InProgressState> => {
  const remainingHand = removeFromHand(hand, cards);

  const topDiscard = await yanivDiscard.peekDiscard(code);
  if (!topDiscard) throw new Error('Discard pile is empty');
  const playResult = isValidYanivPlay(cards, topDiscard);
  if (!playResult.isValid) throw new Error('Invalid card combination');

  return {
    ...state,
    players: updatePlayerHand(state, userId, remainingHand),
    playedCards: playResult.orderedCards,
    gameStep: playResult.isPickupRequired
      ? GameStep.PICKUP_CARD
      : GameStep.PROCEED,
  };
};

const playDrawnCard = (
  state: InProgressState,
  userId: UserId,
  hand: YanivPlayingCard[],
  cards: YanivPlayingCard[],
): InProgressState => {
  if (!state.drawnCard) throw new Error('No drawn card to play back');
  const matchesDrawn =
    cards.length === 1 &&
    cards[0]?.rank === state.drawnCard.rank &&
    cards[0]?.suit === state.drawnCard.suit;
  if (!matchesDrawn) throw new Error('Can only play back the drawn card');

  const remainingHand = removeFromHand(hand, cards);

  const topPlayedCard = state.playedCards[state.playedCards.length - 1];
  if (!topPlayedCard) throw new Error('No played cards to validate against');
  const playResult = isValidYanivPlay(cards, topPlayedCard);
  if (!playResult.isValid) throw new Error('Invalid card combination');

  return {
    ...state,
    players: updatePlayerHand(state, userId, remainingHand),
    playedCards: [...state.playedCards, ...playResult.orderedCards],
    gameStep: GameStep.PROCEED,
    drawnCard: undefined,
  };
};

export const playCards = async (
  code: GameCode,
  userId: UserId,
  cards: YanivPlayingCard[],
) => {
  const state = await getYanivState({ code });
  if (!state) throw new Error('Game not found');

  if (state.gameStage !== GameStage.IN_PROGRESS)
    throw new Error('Game is not in progress');
  if (
    state.gameStep !== GameStep.PLAY_CARDS &&
    state.gameStep !== GameStep.PROCEED
  )
    throw new Error('Cannot play cards in this game step');
  if (state.currentPlayerId !== userId) throw new Error('Not your turn');

  const currentPlayer = state.players.find((player) => player.id === userId);
  if (!currentPlayer) throw new Error('Player not found');

  const isPlayingDrawnCard = state.gameStep === GameStep.PROCEED;
  const newState = isPlayingDrawnCard
    ? playDrawnCard(state, userId, currentPlayer.hand, cards)
    : await playCardsOnTurn(code, state, userId, currentPlayer.hand, cards);

  if (isPlayingDrawnCard) {
    publishEmoji(code, { emoji: '🍀', targetPlayerId: userId, id: Date.now() });
  }

  await setYanivState({ code }, newState);
  await publishYanivState(code, newState);
};
