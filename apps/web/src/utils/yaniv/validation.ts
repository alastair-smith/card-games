import { JOKER_RANK, Rank, type StandardPlayingCard } from '~/types/cards';
import type { YanivPlayingCard } from '~/types/games/yaniv';

const MINIMUM_RUN_SIZE = 3;

const isStandardCard = (card: YanivPlayingCard): card is StandardPlayingCard =>
  card.rank !== JOKER_RANK;

// ACE scores 1 and sits at the bottom of runs despite its enum value of 14.
const runRank = (rank: Rank): number => (rank === Rank.ACE ? 1 : rank);

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
    .map((card) => runRank(card.rank))
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
    (a, b) => runRank(a.rank) - runRank(b.rank),
  );

  const result: YanivPlayingCard[] = [];
  let jokerIdx = 0;

  for (let i = 0; i < nonJokers.length; i++) {
    if (i > 0) {
      const prev = nonJokers[i - 1]!;
      const curr = nonJokers[i]!;
      const gap = runRank(curr.rank) - runRank(prev.rank) - 1;
      for (let g = 0; g < gap && jokerIdx < jokers.length; g++, jokerIdx++) {
        result.push(jokers[jokerIdx]!);
      }
    }
    result.push(nonJokers[i]!);
  }

  // Place remaining jokers: prefer low end if there is a valid rank below the
  // lowest card (run rank > 1), else place at the high end.
  const minRunRank = nonJokers[0] ? runRank(nonJokers[0].rank) : undefined;
  while (jokerIdx < jokers.length) {
    if (minRunRank !== undefined && minRunRank > 1) {
      result.unshift(jokers[jokerIdx]!);
    } else {
      result.push(jokers[jokerIdx]!);
    }
    jokerIdx++;
  }

  return result;
}

export function isValidYanivPlay(
  cards: YanivPlayingCard[],
  topDiscard: YanivPlayingCard,
): PlayResult {
  if (cards.length === 0) return { isValid: false };

  // Matching-rank play (no pickup required): every played card shares the same
  // rank as the top discard. Works for standard cards and joker-on-joker.
  if (cards.every((card) => card.rank === topDiscard.rank)) {
    return { isValid: true, isPickupRequired: false, orderedCards: cards };
  }

  if (isStandardCard(topDiscard)) {
    // Run extension (pickup required): 2+ played cards whose standard-card
    // members all share the top discard's suit, and the combined group forms a
    // consecutive run (jokers in the played cards may fill gaps). The top
    // discard must be at one end of the resulting run.
    if (cards.length >= 2) {
      const combined = [topDiscard, ...cards];
      const nonJokers = combined.filter(isStandardCard);
      const jokerCount = combined.length - nonJokers.length;
      const nonJokerRunRanks = nonJokers.map((card) => runRank(card.rank));
      const minRank = Math.min(...nonJokerRunRanks);
      const maxRank = Math.max(...nonJokerRunRanks);
      const topDiscardRunRank = runRank(topDiscard.rank);
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
