import { PlayingCard } from '~/components/ui/playing-card';
import { Rank, Suit } from '~/types/cards';
import { PlayingCardStack } from '.';

export const EmptyStack = () => <PlayingCardStack />;

export const OneCardStack = () => (
  <PlayingCardStack>
    <PlayingCard card={{ suit: Suit.SPADES, rank: Rank.TEN }} />
  </PlayingCardStack>
);

export const TwoCardStack = () => (
  <PlayingCardStack>
    <PlayingCard card={{ suit: Suit.SPADES, rank: Rank.TEN }} />
    <PlayingCard card={{ suit: Suit.SPADES, rank: Rank.TEN }} />
  </PlayingCardStack>
);

export const ThreeCardStack = () => (
  <PlayingCardStack>
    <PlayingCard card={{ suit: Suit.SPADES, rank: Rank.TEN }} />
    <PlayingCard card={{ suit: Suit.SPADES, rank: Rank.TEN }} />
    <PlayingCard card={{ suit: Suit.SPADES, rank: Rank.TEN }} />
  </PlayingCardStack>
);

export const FourCardStack = () => (
  <PlayingCardStack>
    <PlayingCard card={{ suit: Suit.SPADES, rank: Rank.TEN }} />
    <PlayingCard card={{ suit: Suit.SPADES, rank: Rank.TEN }} />
    <PlayingCard card={{ suit: Suit.SPADES, rank: Rank.TEN }} />
    <PlayingCard card={{ suit: Suit.SPADES, rank: Rank.TEN }} />
  </PlayingCardStack>
);

export const FiveCardStack = () => (
  <PlayingCardStack>
    <PlayingCard card={{ suit: Suit.SPADES, rank: Rank.TEN }} />
    <PlayingCard card={{ suit: Suit.SPADES, rank: Rank.TEN }} />
    <PlayingCard card={{ suit: Suit.SPADES, rank: Rank.TEN }} />
    <PlayingCard card={{ suit: Suit.SPADES, rank: Rank.TEN }} />
    <PlayingCard card={{ suit: Suit.SPADES, rank: Rank.TEN }} />
  </PlayingCardStack>
);

export const SixCardStack = () => (
  <PlayingCardStack>
    <PlayingCard card={{ suit: Suit.SPADES, rank: Rank.TEN }} />
    <PlayingCard card={{ suit: Suit.SPADES, rank: Rank.TEN }} />
    <PlayingCard card={{ suit: Suit.SPADES, rank: Rank.TEN }} />
    <PlayingCard card={{ suit: Suit.SPADES, rank: Rank.TEN }} />
    <PlayingCard card={{ suit: Suit.SPADES, rank: Rank.TEN }} />
    <PlayingCard card={{ suit: Suit.SPADES, rank: Rank.TEN }} />
  </PlayingCardStack>
);

export const SevenCardStack = () => (
  <PlayingCardStack>
    <PlayingCard card={{ suit: Suit.SPADES, rank: Rank.TEN }} />
    <PlayingCard card={{ suit: Suit.SPADES, rank: Rank.TEN }} />
    <PlayingCard card={{ suit: Suit.SPADES, rank: Rank.TEN }} />
    <PlayingCard card={{ suit: Suit.SPADES, rank: Rank.TEN }} />
    <PlayingCard card={{ suit: Suit.SPADES, rank: Rank.TEN }} />
    <PlayingCard card={{ suit: Suit.SPADES, rank: Rank.TEN }} />
    <PlayingCard card={{ suit: Suit.SPADES, rank: Rank.TEN }} />
  </PlayingCardStack>
);

export const EightCardStack = () => (
  <PlayingCardStack>
    <PlayingCard card={{ suit: Suit.SPADES, rank: Rank.TEN }} />
    <PlayingCard card={{ suit: Suit.SPADES, rank: Rank.TEN }} />
    <PlayingCard card={{ suit: Suit.SPADES, rank: Rank.TEN }} />
    <PlayingCard card={{ suit: Suit.SPADES, rank: Rank.TEN }} />
    <PlayingCard card={{ suit: Suit.SPADES, rank: Rank.TEN }} />
    <PlayingCard card={{ suit: Suit.SPADES, rank: Rank.TEN }} />
    <PlayingCard card={{ suit: Suit.SPADES, rank: Rank.TEN }} />
    <PlayingCard card={{ suit: Suit.SPADES, rank: Rank.TEN }} />
  </PlayingCardStack>
);
