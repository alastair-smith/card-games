import { Rank, type StandardPlayingCard } from '~/types/cards';

/** Takes the pile top-first and returns the cards to show, top-first. */
export const getVisibleDiscardCards = (
  discardCards: StandardPlayingCard[],
): StandardPlayingCard[] => {
  const rankToBeat = discardCards.find((card) => card.rank !== Rank.FIVE)?.rank;
  if (rankToBeat === undefined) return discardCards;

  // 5s are invisible and don't break a run, so a 5 only shows above a card it hides
  let visibleCount = 0;
  for (const [index, card] of discardCards.entries()) {
    if (card.rank === rankToBeat) visibleCount = index + 1;
    else if (card.rank !== Rank.FIVE) break;
  }
  return discardCards.slice(0, visibleCount);
};
