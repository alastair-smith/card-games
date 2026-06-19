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
      isPickupDeckOnly?: boolean;
      orderedCards: YanivPlayingCard[];
    };

const isStandardCard = (card: YanivPlayingCard): card is StandardPlayingCard =>
  card.rank !== JOKER_RANK;

/**
 * An ordered run with its endpoints exposed. Jokers may only fill internal gaps,
 * so the lowest and highest cards are always standard cards.
 */
type OrderedRun = {
  cards: YanivPlayingCard[];
  lowCard: StandardPlayingCard;
  highCard: StandardPlayingCard;
};

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

/**
 * Sorts non-jokers ascending by rank and weaves jokers into internal gaps.
 * Returns null if duplicate ranks are found, jokers cannot fill a gap, or
 * spare jokers remain after all gaps are filled.
 */
function buildOrderedRun(cards: YanivPlayingCard[]): OrderedRun | null {
  const jokers = cards.filter((card) => !isStandardCard(card));
  const nonJokers = cards
    .filter(isStandardCard)
    .sort((a, b) => YANIV_RANK_POSITION[a.rank] - YANIV_RANK_POSITION[b.rank]);

  const lowCard = nonJokers[0];
  if (!lowCard) return null; // a run needs a standard card at each end

  const result: YanivPlayingCard[] = [];
  let jokerIndex = 0;
  let previousCard: StandardPlayingCard | undefined;
  let highCard = lowCard;

  for (const card of nonJokers) {
    if (previousCard) {
      const gap =
        YANIV_RANK_POSITION[card.rank] -
        YANIV_RANK_POSITION[previousCard.rank] -
        1;
      if (gap < 0) return null; // duplicate rank
      for (let gapIndex = 0; gapIndex < gap; gapIndex++, jokerIndex++) {
        const jokerCard = jokers[jokerIndex];
        if (!jokerCard) return null;
        result.push(jokerCard);
      }
    }
    result.push(card);
    previousCard = card;
    highCard = card;
  }

  if (jokerIndex < jokers.length) return null; // spare jokers not consumed

  return { cards: result, lowCard, highCard };
}

/**
 * Validates the same-suit constraint and returns the ordered run; null if cards
 * are not all same-suited or don't form a consecutive sequence.
 */
function buildSameSuitRun(cards: YanivPlayingCard[]): OrderedRun | null {
  const nonJokers = cards.filter(isStandardCard);
  const firstNonJoker = nonJokers[0];
  if (!firstNonJoker) return null;
  if (!nonJokers.every(({ suit }) => suit === firstNonJoker.suit)) return null;
  return buildOrderedRun(cards);
}

/** Returns true if the cards form a valid standalone run (3+ same-suit consecutive cards, jokers may fill internal gaps). */
export function isStandaloneRun(cards: YanivPlayingCard[]): boolean {
  if (cards.length < MINIMUM_RUN_SIZE) return false;
  const run = buildSameSuitRun(cards);
  return run !== null && run.cards.length >= MINIMUM_RUN_SIZE;
}

/** Returns true if the cards form any same-suit consecutive sequence (2+), covering both standalone runs and potential run extensions. */
export function isRunShape(cards: YanivPlayingCard[]): boolean {
  if (cards.length < 2) return false;
  return buildSameSuitRun(cards) !== null;
}

/**
 * Returns a valid play result if the cards form a run. Checks standalone runs
 * (3+ cards of the same suit) first, then run extensions (2+ cards that
 * extend a run from the top discard, which must be at one end).
 */
function isRunPlay(
  cards: YanivPlayingCard[],
  topDiscard: YanivPlayingCard,
  direction?: 'ascending' | 'descending',
): PlayResult {
  const run = buildSameSuitRun(cards);
  if (!run) return { isValid: false };

  const { cards: orderedCards, lowCard, highCard } = run;

  // Standalone run: 3+ cards, same suit, consecutive. The play is free only when
  // the first card played (the start of the chosen direction) matches the top
  // discard's rank.
  if (orderedCards.length >= MINIMUM_RUN_SIZE) {
    const playedAscending = direction !== 'descending';
    const finalCards = playedAscending
      ? orderedCards
      : [...orderedCards].reverse();
    const firstCard = playedAscending ? lowCard : highCard;
    const isPickupRequired = firstCard.rank !== topDiscard.rank;
    return { isValid: true, isPickupRequired, orderedCards: finalCards };
  }

  // Run extension: topDiscard must be a standard card with same suit, adjacent to
  // one end — runs don't allow jokers at the ends.
  if (!isStandardCard(topDiscard) || topDiscard.suit !== lowCard.suit)
    return { isValid: false };

  if (
    YANIV_RANK_POSITION[topDiscard.rank] ===
    YANIV_RANK_POSITION[lowCard.rank] - 1
  ) {
    // topDiscard sits below the run — must play ascending
    if (direction !== undefined && direction !== 'ascending')
      return { isValid: false };
    return {
      isValid: true,
      isPickupRequired: true,
      isPickupDeckOnly: true,
      orderedCards,
    };
  }
  if (
    YANIV_RANK_POSITION[topDiscard.rank] ===
    YANIV_RANK_POSITION[highCard.rank] + 1
  ) {
    // topDiscard sits above the run — must play descending
    if (direction !== undefined && direction !== 'descending')
      return { isValid: false };
    return {
      isValid: true,
      isPickupRequired: true,
      isPickupDeckOnly: true,
      orderedCards: [...orderedCards].reverse(),
    };
  }
  return { isValid: false };
}

/** Validates a Yaniv play against the top discard card, returning the play result with ordered cards and whether a pickup is required. */
export function isValidYanivPlay(
  cards: YanivPlayingCard[],
  topDiscard: YanivPlayingCard,
  direction?: 'ascending' | 'descending',
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
  return isRunPlay(cards, topDiscard, direction);
}
