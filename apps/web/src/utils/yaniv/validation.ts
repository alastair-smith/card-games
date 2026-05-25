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
function buildOrderedRun(cards: YanivPlayingCard[]): YanivPlayingCard[] | null {
  const jokers = cards.filter((c) => !isStandardCard(c));
  const nonJokers = cards
    .filter(isStandardCard)
    .sort((a, b) => YANIV_RANK_POSITION[a.rank] - YANIV_RANK_POSITION[b.rank]);

  const result: YanivPlayingCard[] = [];
  let jokerIndex = 0;
  let previousCard: StandardPlayingCard | undefined;

  for (const card of nonJokers) {
    if (previousCard) {
      const gap =
        YANIV_RANK_POSITION[card.rank] -
        YANIV_RANK_POSITION[previousCard.rank] -
        1;
      if (gap < 0) return null; // duplicate rank
      for (let g = 0; g < gap; g++, jokerIndex++) {
        const jokerCard = jokers[jokerIndex];
        if (!jokerCard) return null;
        result.push(jokerCard);
      }
    }
    result.push(card);
    previousCard = card;
  }

  if (jokerIndex < jokers.length) return null; // spare jokers not consumed

  return result;
}

/** Returns true if the cards form a valid standalone run (3+ same-suit consecutive cards, jokers may fill internal gaps). */
export function isStandaloneRun(cards: YanivPlayingCard[]): boolean {
  if (cards.length < MINIMUM_RUN_SIZE) return false;
  const nonJokers = cards.filter(isStandardCard);
  const firstNonJoker = nonJokers[0];
  if (!firstNonJoker) return false;
  if (!nonJokers.every(({ suit }) => suit === firstNonJoker.suit)) return false;
  const ordered = buildOrderedRun(cards);
  return ordered !== null && ordered.length >= MINIMUM_RUN_SIZE;
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
  const nonJokers = cards.filter(isStandardCard);
  const firstNonJoker = nonJokers[0];

  if (!firstNonJoker) return { isValid: false };
  if (!nonJokers.every(({ suit }) => suit === firstNonJoker.suit))
    return { isValid: false };

  const orderedCards = buildOrderedRun(cards);
  if (!orderedCards) return { isValid: false };

  // Standalone run: 3+ cards, same suit, consecutive
  if (orderedCards.length >= MINIMUM_RUN_SIZE) {
    const finalCards =
      direction === 'descending' ? [...orderedCards].reverse() : orderedCards;
    const firstCard = finalCards[0] as StandardPlayingCard;
    const lastCard = finalCards[finalCards.length - 1] as StandardPlayingCard;
    const isPickupRequired =
      firstCard.rank !== topDiscard.rank && lastCard.rank !== topDiscard.rank;
    return { isValid: true, isPickupRequired, orderedCards: finalCards };
  }

  // Run extension: topDiscard must be a standard card with same suit, adjacent to one end
  if (!isStandardCard(topDiscard) || topDiscard.suit !== firstNonJoker.suit)
    return { isValid: false };

  // runs don't allow jokers at the ends
  const firstCard = orderedCards[0] as StandardPlayingCard;
  const lastCard = orderedCards[orderedCards.length - 1] as StandardPlayingCard;

  if (
    YANIV_RANK_POSITION[topDiscard.rank] ===
    YANIV_RANK_POSITION[firstCard.rank] - 1
  ) {
    // topDiscard sits below the run — played cards stay in ascending order
    return {
      isValid: true,
      isPickupRequired: true,
      isPickupDeckOnly: true,
      orderedCards,
    };
  }
  if (
    YANIV_RANK_POSITION[topDiscard.rank] ===
    YANIV_RANK_POSITION[lastCard.rank] + 1
  ) {
    // topDiscard sits above the run — played cards returned in descending order
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
