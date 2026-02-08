import { Rank, Suit } from '~/types/cards';
import Hand from '.';

export default {
  title: 'Yaniv / Hand',
};

const defaultProps: React.ComponentProps<typeof Hand> = {
  cards: [
    {
      suit: Suit.CLUBS,
      rank: Rank.ACE,
    },
    {
      suit: Suit.HEARTS,
      rank: Rank.KING,
    },
    {
      suit: Suit.SPADES,
      rank: Rank.QUEEN,
    },
    {
      suit: Suit.DIAMONDS,
      rank: Rank.JACK,
    },
    {
      suit: Suit.CLUBS,
      rank: Rank.TEN,
    },
    {
      suit: Suit.HEARTS,
      rank: Rank.NINE,
    },
    {
      suit: Suit.SPADES,
      rank: Rank.EIGHT,
    },
  ],
  isFiftyScoreHalved: false,
  isHundredScoreHalved: false,
  score: 200,
  handScore: 0,
  totalScore: 0,
};

export const FullHand = () => {
  return <Hand {...defaultProps} />;
};
