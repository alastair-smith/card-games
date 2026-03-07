import { JOKER_RANK, type StandardPlayingCard } from '~/types/cards';
import type { YanivPlayingCard } from '~/types/games/yaniv';

const isStandardCard = (card: YanivPlayingCard): card is StandardPlayingCard =>
  card.rank !== JOKER_RANK;

export function isValidYanivPlay(cards: YanivPlayingCard[]): boolean {
  if (cards.length === 0) return false;
  if (cards.length === 1) return true;

  const jokers = cards.filter((card) => !isStandardCard(card));
  const nonJokers = cards.filter(isStandardCard);

  // Set check: all non-jokers share the same rank (vacuously true for all-joker hands)
  const [firstCard] = nonJokers;
  if (!firstCard) return true;
  if (nonJokers.every((card) => card.rank === firstCard.rank)) return true;

  // Run check: all non-jokers share the same suit, no duplicate ranks,
  // and the gaps between sorted ranks can be filled by jokers
  if (!nonJokers.every((card) => card.suit === firstCard.suit)) return false;

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

  return !hasDuplicates && gapsInside <= jokers.length;
}
