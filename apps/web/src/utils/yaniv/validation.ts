import { JOKER_RANK, type StandardPlayingCard } from '~/types/cards';
import type { YanivPlayingCard } from '~/types/games/yaniv';

const MINIMUM_RUN_SIZE = 3;

const isStandardCard = (card: YanivPlayingCard): card is StandardPlayingCard =>
  card.rank !== JOKER_RANK;

export type PlayResult = { isValid: boolean; isPickupRequired: boolean };

// Checks whether nonJokers (same-suit standard cards) form a valid run when
// jokerCount wildcards are available to fill gaps.
function isConsecutiveRun(
  nonJokers: StandardPlayingCard[],
  jokerCount: number,
): boolean {
  if (nonJokers.length === 0) return true;
  const sortedRanks = nonJokers
    .map((card) => card.rank)
    .sort((rankA, rankB) => rankA - rankB);
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

export function isValidYanivPlay(
  cards: YanivPlayingCard[],
  topDiscard: YanivPlayingCard,
): PlayResult {
  if (cards.length === 0) return { isValid: false, isPickupRequired: false };

  if (isStandardCard(topDiscard)) {
    // Matching-rank play (no pickup required): every played card is a standard
    // card sharing the same rank as the top discard.
    if (
      cards.every(
        (card) => isStandardCard(card) && card.rank === topDiscard.rank,
      )
    ) {
      return { isValid: true, isPickupRequired: false };
    }

    // Run extension (pickup required): 2+ played cards whose standard-card
    // members all share the top discard's suit, and the combined group forms a
    // consecutive run (jokers in the played cards may fill gaps).
    if (cards.length >= 2) {
      const combined = [topDiscard, ...cards];
      const nonJokers = combined.filter(isStandardCard);
      const jokerCount = combined.length - nonJokers.length;
      if (
        nonJokers.every((card) => card.suit === topDiscard.suit) &&
        isConsecutiveRun(nonJokers, jokerCount)
      ) {
        return { isValid: true, isPickupRequired: true };
      }
    }
  }

  // Standalone validation
  if (cards.length === 1) return { isValid: true, isPickupRequired: true };

  const jokers = cards.filter((card) => !isStandardCard(card));
  const nonJokers = cards.filter(isStandardCard);

  // Set check: all non-jokers share the same rank (vacuously true for all-joker hands)
  const [firstCard] = nonJokers;
  if (!firstCard) return { isValid: true, isPickupRequired: true };
  if (nonJokers.every((card) => card.rank === firstCard.rank))
    return { isValid: true, isPickupRequired: true };

  // Run check: runs need at least 3 cards, all non-jokers share the same suit,
  // no duplicate ranks, and the gaps between sorted ranks can be filled by jokers
  if (cards.length < MINIMUM_RUN_SIZE)
    return { isValid: false, isPickupRequired: false };
  if (!nonJokers.every((card) => card.suit === firstCard.suit))
    return { isValid: false, isPickupRequired: false };

  return isConsecutiveRun(nonJokers, jokers.length)
    ? { isValid: true, isPickupRequired: true }
    : { isValid: false, isPickupRequired: false };
}
