import { type StandardPlayingCard, SUITS } from '~/types/cards';

/** Sorts by rank, lowest first, then suit, so cards of a rank sit together. */
export function sortShitheadHand<Card extends StandardPlayingCard>(
  cards: Card[],
): Card[] {
  return [...cards].sort(
    (first, second) =>
      first.rank - second.rank ||
      SUITS.indexOf(first.suit) - SUITS.indexOf(second.suit),
  );
}
