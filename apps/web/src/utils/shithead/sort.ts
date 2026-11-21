import { type Rank, type StandardPlayingCard, SUITS } from '~/types/cards';

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

/** Groups sorted cards into one group per rank, keeping their order. */
export function groupByRank<Card extends StandardPlayingCard>(
  sortedCards: Card[],
): { rank: Rank; cards: Card[] }[] {
  const groups: { rank: Rank; cards: Card[] }[] = [];
  for (const card of sortedCards) {
    const lastGroup = groups.at(-1);
    if (lastGroup?.rank === card.rank) {
      lastGroup.cards.push(card);
    } else {
      groups.push({ rank: card.rank, cards: [card] });
    }
  }
  return groups;
}
