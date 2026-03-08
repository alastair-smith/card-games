import { JOKER_RANK, type StandardPlayingCard } from '~/types/cards';
import {
  MINIMUM_RUN_SIZE,
  YANIV_RANK_POSITION,
  type YanivPlayingCard,
} from '~/types/games/yaniv';

export type PlayResult =
  | { isValid: false }
  | {
      isValid: true;
      isPickupRequired: boolean;
      orderedCards: YanivPlayingCard[];
    };

const isStandardCard = (card: YanivPlayingCard): card is StandardPlayingCard =>
  card.rank !== JOKER_RANK;

/** Returns a valid play result if all cards share the same rank (n-of-a-kind or all jokers). No pickup required when the shared rank matches the top discard. */
function isSameRankPlay(
  cards: YanivPlayingCard[],
  topDiscard: YanivPlayingCard,
): PlayResult {
  const [first] = cards;
  if (!first) return { isValid: false };
  if (!cards.every(({ rank }) => rank === first.rank))
    return { isValid: false };
  return {
    isValid: true,
    isPickupRequired: first.rank !== topDiscard.rank,
    orderedCards: cards,
  };
}

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

  return !hasDuplicates && gapsInside === jokerCount;
}

/**
 * Orders a run of cards ascending by run rank, weaving jokers into internal
 * gaps. Any remaining spare jokers are prepended (low end) when
 * spareJokersToHighEnd is false (default), or appended (high end) when true.
 */
function orderRunAscending(
  cards: YanivPlayingCard[],
  spareJokersToHighEnd = false,
): YanivPlayingCard[] {
  const jokers = cards.filter((c) => !isStandardCard(c));
  const nonJokers = [...cards.filter(isStandardCard)].sort(
    (a, b) => YANIV_RANK_POSITION[a.rank] - YANIV_RANK_POSITION[b.rank],
  );

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
    if (spareJokersToHighEnd) {
      result.push(joker);
    } else {
      result.unshift(joker);
    }
  }

  return result;
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
  const jokerCount = cards.length - nonJokers.length;
  const firstNonJoker = nonJokers[0];

  // Standalone run: 3+ cards, same suit, consecutive (jokers fill gaps)
  if (
    cards.length >= MINIMUM_RUN_SIZE &&
    !!firstNonJoker &&
    nonJokers.every(({ suit }) => suit === firstNonJoker.suit) &&
    isConsecutiveRun(nonJokers, jokerCount)
  ) {
    return {
      isValid: true,
      isPickupRequired: true,
      orderedCards: orderRunAscending(cards),
    };
  }

  // Run extension: topDiscard must be a standard card at one end of the combined run
  if (!isStandardCard(topDiscard) || cards.length < 2)
    return { isValid: false };

  const combined = [topDiscard, ...cards];
  const combinedNonJokers = combined.filter(isStandardCard);

  if (!combinedNonJokers.every((c) => c.suit === topDiscard.suit))
    return { isValid: false };
  if (!isConsecutiveRun(combinedNonJokers, jokerCount))
    return { isValid: false };

  const topPosition = YANIV_RANK_POSITION[topDiscard.rank];
  const positions = combinedNonJokers.map((c) => YANIV_RANK_POSITION[c.rank]);
  const minPosition = Math.min(...positions);
  const maxPosition = Math.max(...positions);

  if (topPosition !== minPosition && topPosition !== maxPosition)
    return { isValid: false };

  const orderedCards =
    topPosition === minPosition
      ? orderRunAscending(cards) // spare jokers → low end (toward discard above)
      : orderRunAscending(cards, true).reverse(); // spare jokers → high end, then reversed
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
