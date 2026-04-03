import { YANIV_RANK_SCORE, type YanivPlayingCard } from '~/types/games/yaniv';

/** Picks the worst card to play from a hand given the top discard card.
 *
 * Plays the single lowest-value card that does NOT match the discard rank.
 * If all cards match the discard rank, falls back to the single lowest-value card.
 */
export const pickWorstMove = (
  hand: YanivPlayingCard[],
  topDiscardCard: YanivPlayingCard,
): YanivPlayingCard[] => {
  const nonMatching = hand.filter((card) => card.rank !== topDiscardCard.rank);
  const candidates = nonMatching.length > 0 ? nonMatching : hand;

  return [
    candidates.reduce((lowest, card) =>
      YANIV_RANK_SCORE[card.rank] < YANIV_RANK_SCORE[lowest.rank]
        ? card
        : lowest,
    ),
  ];
};
