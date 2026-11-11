import { Rank, type StandardPlayingCard } from '~/types/cards';

const getVisibleCardsFrom = (
  discardCards: StandardPlayingCard[],
  rankToBeat: Rank | null,
): StandardPlayingCard[] => {
  const [topCard, ...cardsBelow] = discardCards;
  if (!topCard) return [];

  if (topCard.rank === Rank.FIVE) {
    const visibleCardsBelow = getVisibleCardsFrom(cardsBelow, rankToBeat);
    // A 5 is invisible, so it only shows above a card it hides, or in a pile of only 5s
    return rankToBeat === null || visibleCardsBelow.length > 0
      ? [topCard, ...visibleCardsBelow]
      : [];
  }

  if (rankToBeat === null || topCard.rank === rankToBeat) {
    return [topCard, ...getVisibleCardsFrom(cardsBelow, topCard.rank)];
  }

  return [];
};

/** Takes the pile top-first and returns the cards to show, top-first. */
export const getVisibleDiscardCards = (
  discardCards: StandardPlayingCard[],
): StandardPlayingCard[] => getVisibleCardsFrom(discardCards, null);
