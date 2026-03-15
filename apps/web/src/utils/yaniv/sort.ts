import { JokerSuit, Suit } from '~/types/cards';
import {
  YANIV_RANK_POSITION,
  type YanivPlayingCard,
} from '~/types/games/yaniv';

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
    const rankDiff = YANIV_RANK_POSITION[b.rank] - YANIV_RANK_POSITION[a.rank];
    if (rankDiff !== 0) return rankDiff;
    return HAND_DISPLAY_SUIT_ORDER[b.suit] - HAND_DISPLAY_SUIT_ORDER[a.suit];
  });
