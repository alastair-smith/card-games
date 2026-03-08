import { JOKER_RANK, type StandardPlayingCard } from '~/types/cards';
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

/** Checks whether nonJokers (same-suit standard cards) form a valid run when jokerCount wildcards are available to fill gaps. */
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

/**
 * Orders a run of cards ascending by run rank, weaving jokers into internal
 * gaps. Any remaining jokers are placed at the low end if min run rank > 1
 * (i.e. there is a valid rank below the lowest card), else at the high end.
 */
function orderRunAscending(cards: YanivPlayingCard[]): YanivPlayingCard[] {
  const jokers = cards.filter((c) => !isStandardCard(c));
  const nonJokers = [...cards.filter(isStandardCard)].sort(
    (a, b) => YANIV_RANK_POSITION[a.rank] - YANIV_RANK_POSITION[b.rank],
  );

  // Place remaining jokers: prefer low end if there is a valid rank below the
  // lowest card (run rank > 1), else place at the high end.
  const firstNonJoker = nonJokers[0];
  const preferLowEnd =
    firstNonJoker !== undefined && YANIV_RANK_POSITION[firstNonJoker.rank] > 1;

  const result: YanivPlayingCard[] = [];
  let jokerIdx = 0;
  let prevNonJoker: StandardPlayingCard | undefined;

  for (const curr of nonJokers) {
    if (prevNonJoker !== undefined) {
      const gap =
        YANIV_RANK_POSITION[curr.rank] -
        YANIV_RANK_POSITION[prevNonJoker.rank] -
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

/** Returns a valid play result if all cards share the same rank (n-of-a-kind or all jokers). No pickup required when the shared rank matches the top discard. */
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

/**
 * Returns a valid play result if the cards form a run. Checks standalone runs
 * (3+ cards of the same suit) first, then run extensions (2+ cards that
 * extend a run from the top discard, which must be at one end).
 */
function isRunPlay(
  cards: YanivPlayingCard[],
  topDiscard: YanivPlayingCard,
): PlayResult {
  const nonJokers = cards.filter(isStandardCard);
  const jokers = cards.filter((card) => !isStandardCard(card));

  // Standalone run: all nonJokers same suit, consecutive (gaps filled by jokers), 3+ cards total
  const firstNonJoker = nonJokers[0];
  if (cards.length >= MINIMUM_RUN_SIZE && firstNonJoker !== undefined) {
    if (
      nonJokers.every((card) => card.suit === firstNonJoker.suit) &&
      isConsecutiveRun(nonJokers, jokers.length)
    ) {
      return {
        isValid: true,
        isPickupRequired: true,
        orderedCards: orderRunAscending(cards),
      };
    }
  }

  // Run extension: topDiscard must be a standard card and at one end of the combined run
  if (!isStandardCard(topDiscard) || cards.length < 2)
    return { isValid: false };

  const combined = [topDiscard, ...cards];
  const combinedNonJokers = combined.filter(isStandardCard);
  const jokerCount = combined.length - combinedNonJokers.length;

  if (!combinedNonJokers.every((card) => card.suit === topDiscard.suit))
    return { isValid: false };

  const positions = combinedNonJokers.map((c) => YANIV_RANK_POSITION[c.rank]);
  const minPos = Math.min(...positions);
  const maxPos = Math.max(...positions);
  const topDiscardPos = YANIV_RANK_POSITION[topDiscard.rank];
  const topDiscardAtEnd = topDiscardPos === minPos || topDiscardPos === maxPos;

  if (!topDiscardAtEnd || !isConsecutiveRun(combinedNonJokers, jokerCount))
    return { isValid: false };

  // Order played cards: adjacent to topDiscard first, farthest last
  const extendingAbove = topDiscardPos === minPos;
  const orderedCards = extendingAbove
    ? orderRunAscending(cards)
    : orderRunAscending(cards).reverse();
  return { isValid: true, isPickupRequired: true, orderedCards };
}

/** Validates a Yaniv play against the top discard card, returning the play result with ordered cards and whether a pickup is required. */
export function isValidYanivPlay(
  cards: YanivPlayingCard[],
  topDiscard: YanivPlayingCard,
): PlayResult {
  // no cards
  if (cards.length === 0) return { isValid: false };

  // single card
  const [singleCard] = cards;
  if (cards.length === 1 && singleCard !== undefined) {
    return {
      isValid: true,
      isPickupRequired: singleCard.rank !== topDiscard.rank,
      orderedCards: cards,
    };
  }

  // n of a kind
  const sameRankPlay = isSameRankPlay(cards, topDiscard);
  if (sameRankPlay.isValid) {
    return sameRankPlay;
  }

  // run
  return isRunPlay(cards, topDiscard);
}
