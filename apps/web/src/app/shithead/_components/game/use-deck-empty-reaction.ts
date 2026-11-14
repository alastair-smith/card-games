import { useState } from 'react';
import type { EmojiReactionId } from '~/types/entities';

const DECK_EMPTY_REACTION = {
  emoji: '🫥',
  id: 'deck-empty' as EmojiReactionId,
};

/**
 * A reaction to rain once the deck runs out while the player is watching,
 * not when they join a game whose deck is already empty.
 */
export function useDeckEmptyReaction(deckSize: number) {
  const [previousDeckSize, setPreviousDeckSize] = useState(deckSize);
  const [isDeckEmptied, setIsDeckEmptied] = useState(false);

  if (deckSize !== previousDeckSize) {
    setPreviousDeckSize(deckSize);
    if (deckSize === 0) setIsDeckEmptied(true);
  }

  return isDeckEmptied ? DECK_EMPTY_REACTION : null;
}
