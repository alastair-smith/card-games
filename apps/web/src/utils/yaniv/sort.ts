import { JOKER_RANK, JokerSuit, Rank, Suit } from '~/types/cards';
import type { YanivPlayingCard } from '~/types/games/yaniv';

const HAND_DISPLAY_RANK_ORDER: Record<Rank | typeof JOKER_RANK, number> = {
  [JOKER_RANK]: 0,
  [Rank.ACE]: 1,
  [Rank.TWO]: 2,
  [Rank.THREE]: 3,
  [Rank.FOUR]: 4,
  [Rank.FIVE]: 5,
  [Rank.SIX]: 6,
  [Rank.SEVEN]: 7,
  [Rank.EIGHT]: 8,
  [Rank.NINE]: 9,
  [Rank.TEN]: 10,
  [Rank.JACK]: 11,
  [Rank.QUEEN]: 12,
  [Rank.KING]: 13,
};

const HAND_DISPLAY_SUIT_ORDER: Record<Suit | JokerSuit, number> = {
  [Suit.DIAMONDS]: 1,
  [Suit.CLUBS]: 2,
  [Suit.HEARTS]: 3,
  [Suit.SPADES]: 4,
  [JokerSuit.RED]: 1,
  [JokerSuit.BLACK]: 4,
};

export const sortYanivHand = <T extends YanivPlayingCard>(cards: T[]): T[] =>
  [...cards].sort((a, b) => {
    const rankDiff =
      HAND_DISPLAY_RANK_ORDER[b.rank] - HAND_DISPLAY_RANK_ORDER[a.rank];
    if (rankDiff !== 0) return rankDiff;
    return HAND_DISPLAY_SUIT_ORDER[b.suit] - HAND_DISPLAY_SUIT_ORDER[a.suit];
  });
