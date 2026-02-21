import { action } from '@ladle/react';
import { Rank, Suit } from '~/types/cards';
import PlayArea from '.';

export default {
  title: 'Yaniv / Play-area',
};

const defaultProps: React.ComponentProps<typeof PlayArea> = {
  playedCards: [
    {
      suit: Suit.HEARTS,
      rank: Rank.SEVEN,
    },
    {
      suit: Suit.DIAMONDS,
      rank: Rank.SEVEN,
    },
    {
      suit: Suit.SPADES,
      rank: Rank.SEVEN,
    },
  ],
  discardCard: {
    suit: Suit.CLUBS,
    rank: Rank.FOUR,
  },
  onDiscardClick: action('discard clicked'),
  onDeckClick: action('deck clicked'),
};

export function AllAreasFull() {
  return <PlayArea {...defaultProps} />;
}

export function NoDiscard() {
  return <PlayArea {...defaultProps} discardCard={null} />;
}

export function NoPlayed() {
  return <PlayArea {...defaultProps} playedCards={[]} />;
}

export function NoCards() {
  return <PlayArea {...defaultProps} discardCard={null} playedCards={[]} />;
}

export function PlayedMaxCards() {
  return (
    <PlayArea
      {...defaultProps}
      playedCards={[
        { suit: Suit.SPADES, rank: Rank.TWO },
        { suit: Suit.SPADES, rank: Rank.THREE },
        { suit: Suit.SPADES, rank: Rank.FOUR },
        { suit: Suit.SPADES, rank: Rank.FIVE },
        { suit: Suit.SPADES, rank: Rank.SIX },
        { suit: Suit.SPADES, rank: Rank.SEVEN },
        { suit: Suit.SPADES, rank: Rank.EIGHT },
      ]}
    />
  );
}
