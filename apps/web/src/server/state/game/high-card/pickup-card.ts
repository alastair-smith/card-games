import {
  createDeck,
  deckExists,
  drawCard,
  getDeckSize,
} from '~/server/data/deck';
import { getHighCardState, setHighCardState } from '~/server/data/high-card';
import { publishHighCard } from '~/server/events/high-card';
import { standardDeck } from '~/types/cards';
import type { UserId } from '~/types/entities';
import type { GameCode } from '~/types/game';
import { GameStage } from '~/types/games/high-card';
import { shuffle } from '~/utils/cards';

export const pickupCard = async (code: GameCode, userId: UserId) => {
  const gameState = await getHighCardState({ code });

  if (!gameState) {
    throw new Error('Game not found');
  }

  if (gameState.stage !== GameStage.IN_PROGRESS) {
    throw new Error('Game is not in progress');
  }

  const player = gameState.players.find((p) => p.id === userId);

  if (!player) {
    throw new Error('Player not in game');
  }

  if (player.card) {
    // Player has already picked a card, so do nothing.
    return;
  }

  const isDeckCreated = await deckExists(code);
  if (!isDeckCreated) {
    // This is the first player to draw, so create and shuffle the deck.
    const shuffledDeck = shuffle(standardDeck);
    await createDeck(code, shuffledDeck);
  }

  const card = await drawCard(code);

  if (!card) {
    // This should not happen in a normal game
    throw new Error('Deck is empty');
  }

  // Assign the card to the player
  const newPlayers = gameState.players.map((p) =>
    p.id === userId ? { ...p, card } : p,
  );

  const newState = { ...gameState, players: newPlayers };

  const remainingCards = await getDeckSize(code);
  const allPlayersHaveCards = newPlayers.every((p) => p.card);

  if (allPlayersHaveCards || remainingCards === 0) {
    // All players have drawn, or the deck is empty. End the game.
    newState.stage = GameStage.FINISHED;

    const highestRank = Math.max(
      ...newState.players.map((p) => p.card?.rank ?? 0),
    );
    newState.winners = newState.players
      .filter((p) => p.card?.rank === highestRank)
      .map((p) => p.id);
  }

  await setHighCardState({ code }, newState);
  await publishHighCard(code, newState);

  return newState;
};
