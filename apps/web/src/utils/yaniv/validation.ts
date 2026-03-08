import { JOKER_RANK, Rank, type StandardPlayingCard } from '~/types/cards';
import {
  MINIMUM_RUN_SIZE,
  YANIV_RANK_POSITION,
  type YanivPlayingCard,
} from '~/types/games/yaniv';

const isStandardCard = (card: YanivPlayingCard): card is StandardPlayingCard =>
  card.rank !== JOKER_RANK;

export type PlayResult =
  | { isValid: false }
  | {
      isValid: true;
      isPickupRequired: boolean;
      orderedCards: YanivPlayingCard[];
    };

// Checks whether nonJokers (same-suit standard cards) form a valid run when
// jokerCount wildcards are available to fill gaps.
function isConsecutiveRun(
  nonJokers: StandardPlayingCard[],
  jokerCount: number,
): boolean {
  if (nonJokers.length === 0) return true;
  const sortedRanks = nonJokers
    .map((card) => YANIV_RANK_POSITION[card.rank])
    .sort((a, b) => a - b);
  const [firstRank, ...restRanks] = sortedRanks;
  if (firstRank === undefined) return false;

  const { hasDuplicates, gapsInside } = restRanks.reduce(
    (acc, rank) => ({
      prev: rank,
      hasDuplicates: acc.hasDuplicates || rank === acc.prev,
      gapsInside: acc.gapsInside + rank - acc.prev - 1,
    }),
    { prev: firstRank, hasDuplicates: false, gapsInside: 0 },
  );

  return !hasDuplicates && gapsInside <= jokerCount;
}

// Orders a run of cards ascending by run rank, weaving jokers into internal
// gaps. Any remaining jokers are placed at the low end if min run rank > 1
// (i.e. there is a valid rank below the lowest card), else at the high end.
function orderRunAscending(cards: YanivPlayingCard[]): YanivPlayingCard[] {
  const jokers = cards.filter((c) => !isStandardCard(c));
  const nonJokers = [...cards.filter(isStandardCard)].sort(
    (a, b) =>
      (a.rank === Rank.ACE ? 1 : a.rank) - (b.rank === Rank.ACE ? 1 : b.rank),
  );

  // Place remaining jokers: prefer low end if there is a valid rank below the
  // lowest card (run rank > 1), else place at the high end.
  const firstNonJoker = nonJokers[0];
  const preferLowEnd =
    firstNonJoker !== undefined &&
    (firstNonJoker.rank === Rank.ACE ? 1 : firstNonJoker.rank) > 1;

  const result: YanivPlayingCard[] = [];
  let jokerIdx = 0;
  let prevNonJoker: StandardPlayingCard | undefined;

  for (const curr of nonJokers) {
    if (prevNonJoker !== undefined) {
      const gap =
        (curr.rank === Rank.ACE ? 1 : curr.rank) -
        (prevNonJoker.rank === Rank.ACE ? 1 : prevNonJoker.rank) -
        1;
      for (let g = 0; g < gap && jokerIdx < jokers.length; g++, jokerIdx++) {
        const joker = jokers[jokerIdx];
        if (joker !== undefined) result.push(joker);
      }
    }
    result.push(curr);
    prevNonJoker = curr;
  }

  for (const joker of jokers.slice(jokerIdx)) {
    if (preferLowEnd) {
      result.unshift(joker);
    } else {
      result.push(joker);
    }
  }

  return result;
}

function isSameRankPlay(
  cards: YanivPlayingCard[],
  topDiscard: YanivPlayingCard,
): PlayResult {
  const nonJokers = cards.filter(isStandardCard);
  const jokers = cards.filter((card) => !isStandardCard(card));

  if (!nonJokers[0]) {
    // all cards are jokers
    return {
      isValid: true,
      isPickupRequired: topDiscard.rank !== JOKER_RANK,
      orderedCards: cards,
    };
  }

  const sharedRank = nonJokers[0].rank;

  if (nonJokers.every((card) => card.rank === sharedRank)) {
    return {
      isValid: true,
      isPickupRequired: sharedRank !== topDiscard.rank,
      orderedCards: [...jokers, ...nonJokers],
    };
  }

  return {
    isValid: false,
  };
}

function isRunPlay(
  cards: YanivPlayingCard[],
  topDiscard: YanivPlayingCard,
): PlayResult {
  const nonJokers = cards.filter(isStandardCard);
  const jokers = cards.filter((card) => !isStandardCard(card));

  // sort nonJokers
  const sortedNonJokers = [...nonJokers].sort(
    (a, b) => YANIV_RANK_POSITION[a.rank] - YANIV_RANK_POSITION[b.rank],
  );

  // check if non jokers are in order, fill gaps with jokers if needed
  sortedNonJokers.reduce(); // ???

  // return false if can't get a run

  // check if either end connects to the discard

  // put remaining jokers on end
}

export function isValidYanivPlay(
  cards: YanivPlayingCard[],
  topDiscard: YanivPlayingCard,
): PlayResult {
  // no cards
  if (cards.length === 0) return { isValid: false };

  if (!cards[0]) {
    throw new Error('Card not found despite length check');
  }

  // single card
  if (cards.length === 1) {
    return {
      isValid: true,
      isPickupRequired: cards[0].rank !== topDiscard.rank,
      orderedCards: cards,
    };
  }

  // n of a kind
  const sameRankPlay = isSameRankPlay(cards, topDiscard);
  if (sameRankPlay.isValid) {
    return sameRankPlay;
  }

  // run
  const runPlay = isRunPlay(cards, topDiscard);
  if (runPlay.isValid) {
    return runPlay;
  }

  /** remove all this below as it has been replaced with the above  */

  if (isStandardCard(topDiscard)) {
    // Run extension (pickup required): 2+ played cards whose standard-card
    // members all share the top discard's suit, and the combined group forms a
    // consecutive run (jokers in the played cards may fill gaps). The top
    // discard must be at one end of the resulting run.
    if (cards.length >= 2) {
      const combined = [topDiscard, ...cards];
      const nonJokers = combined.filter(isStandardCard);
      const jokerCount = combined.length - nonJokers.length;
      const nonJokerRunRanks = nonJokers.map((card) =>
        card.rank === Rank.ACE ? 1 : card.rank,
      );
      const minRank = Math.min(...nonJokerRunRanks);
      const maxRank = Math.max(...nonJokerRunRanks);
      const topDiscardRunRank =
        topDiscard.rank === Rank.ACE ? 1 : topDiscard.rank;
      const topDiscardAtEnd =
        topDiscardRunRank === minRank || topDiscardRunRank === maxRank;
      if (
        topDiscardAtEnd &&
        nonJokers.every((card) => card.suit === topDiscard.suit) &&
        isConsecutiveRun(nonJokers, jokerCount)
      ) {
        // Order played cards: adjacent to topDiscard first, farthest last.
        const extendingAbove = topDiscardRunRank === minRank;
        const orderedCards = extendingAbove
          ? orderRunAscending(cards)
          : orderRunAscending(cards).reverse();
        return { isValid: true, isPickupRequired: true, orderedCards };
      }
    }
  }

  // Standalone validation
  if (cards.length === 1)
    return { isValid: true, isPickupRequired: true, orderedCards: cards };

  const jokers = cards.filter((card) => !isStandardCard(card));
  const nonJokers = cards.filter(isStandardCard);

  // Set check: all non-jokers share the same rank (vacuously true for all-joker
  // hands). Jokers are ordered first.
  const [firstCard] = nonJokers;
  if (!firstCard)
    return {
      isValid: true,
      isPickupRequired: true,
      orderedCards: [...jokers, ...nonJokers],
    };
  if (nonJokers.every((card) => card.rank === firstCard.rank))
    return {
      isValid: true,
      isPickupRequired: true,
      orderedCards: [...jokers, ...nonJokers],
    };

  // Run check: runs need at least 3 cards, all non-jokers share the same suit,
  // no duplicate ranks, and the gaps between sorted ranks can be filled by jokers
  if (cards.length < MINIMUM_RUN_SIZE) return { isValid: false };
  if (!nonJokers.every((card) => card.suit === firstCard.suit))
    return { isValid: false };

  return isConsecutiveRun(nonJokers, jokers.length)
    ? {
        isValid: true,
        isPickupRequired: true,
        orderedCards: orderRunAscending(cards),
      }
    : { isValid: false };
}
