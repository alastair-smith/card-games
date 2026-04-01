import { JOKER_RANK } from '~/types/cards';
import { YANIV_RANK_SCORE, type YanivPlayingCard } from '~/types/games/yaniv';

/** Picks the best cards to play from a hand given the top discard card.
 *
 * Jokers are never played — they score 0 and are too valuable to discard.
 *
 * Priority:
 * 1. All non-joker cards whose rank matches the discard rank (no pickup required)
 * 2. The largest same-rank group (ties broken by highest score value)
 * 3. The single highest-value non-joker card
 */
export const pickBestMove = (
  hand: YanivPlayingCard[],
  topDiscardCard: YanivPlayingCard,
): YanivPlayingCard[] => {
  const nonJokers = hand.filter((card) => card.rank !== JOKER_RANK);
  const playableHand = nonJokers.length > 0 ? nonJokers : hand;

  const matchingDiscard = playableHand.filter(
    (card) => card.rank === topDiscardCard.rank,
  );
  if (matchingDiscard.length > 0) return matchingDiscard;

  const rankGroups = new Map<string, YanivPlayingCard[]>();
  for (const card of playableHand) {
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
    playableHand.reduce((highest, card) =>
      YANIV_RANK_SCORE[card.rank] > YANIV_RANK_SCORE[highest.rank]
        ? card
        : highest,
    ),
  ];
};
