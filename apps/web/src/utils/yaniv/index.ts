import { YANIV_RANK_SCORE, type YanivPlayingCard } from '~/types/games/yaniv';

export const sumYanivHand = (cards: YanivPlayingCard[]) => {
  return cards.reduce((sum, card) => {
    return sum + YANIV_RANK_SCORE[card.rank];
  }, 0);
};
