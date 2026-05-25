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
import { reshuffleDeck } from './reshuffle-deck';

const drawFromDeck = async (code: GameCode): Promise<YanivPlayingCard> => {
  const deckSize = await yanivDeck.getDeckSize(code);
  if (deckSize === 0) {
    await reshuffleDeck(code);
  }
  const card = await yanivDeck.drawCard(code);
  if (!card) throw new Error('Deck is empty');
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

  if (state.deckOnlyPickup && source === 'discard')
    throw new Error('Cannot pick up from the discard after playing a run extension');

  const currentPlayer = state.players.find((player) => player.id === userId);
  if (!currentPlayer) throw new Error('Player not found');

  const drawnCard =
    source === 'deck' ? await drawFromDeck(code) : await drawFromDiscard(code);

  const updatedHand = [...currentPlayer.hand, drawnCard];

  const updatedPlayers = state.players.map((player) =>
    player.id === userId
      ? { ...player, hand: updatedHand, cardCount: updatedHand.length }
      : player,
  );

  const newState = {
    ...state,
    players: updatedPlayers,
    gameStep: GameStep.PROCEED,
    deckOnlyPickup: undefined,
    ...(source === 'deck' ? { drawnCard } : { drawnCard: undefined }),
  };

  await setYanivState({ code }, newState);
  await publishYanivState(code, newState);
};
