import { YANIV_RANK_SCORE, type YanivPlayingCard } from '~/types/games/yaniv';

/** Picks the best cards to play from a hand given the top discard card.
 *
 * Priority:
 * 1. All cards whose rank matches the discard rank (no pickup required)
 * 2. The largest same-rank group (ties broken by highest score value)
 * 3. The single highest-value card
 */
export const pickBestMove = (
  hand: YanivPlayingCard[],
  topDiscardCard: YanivPlayingCard,
): YanivPlayingCard[] => {
  const matchingDiscard = hand.filter((c) => c.rank === topDiscardCard.rank);
  if (matchingDiscard.length > 0) return matchingDiscard;

  const rankGroups = new Map<string, YanivPlayingCard[]>();
  for (const card of hand) {
    const key = String(card.rank);
    const group = rankGroups.get(key) ?? [];
    group.push(card);
    rankGroups.set(key, group);
  }

  const multiGroups = [...rankGroups.values()].filter((g) => g.length > 1);
  if (multiGroups.length > 0) {
    multiGroups.sort((a, b) => {
      const lenDiff = b.length - a.length;
      if (lenDiff !== 0) return lenDiff;
      const aScore = a[0] !== undefined ? YANIV_RANK_SCORE[a[0].rank] : 0;
      const bScore = b[0] !== undefined ? YANIV_RANK_SCORE[b[0].rank] : 0;
      return bScore - aScore;
    });
    const best = multiGroups[0];
    if (best !== undefined) return best;
  }

  return [
    hand.reduce((highest, card) =>
      YANIV_RANK_SCORE[card.rank] > YANIV_RANK_SCORE[highest.rank]
        ? card
        : highest,
    ),
  ];
};
