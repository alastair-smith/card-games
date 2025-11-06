import { useEffect, useState } from 'react';
import { PlayingCard } from '~/components/ui/playing-card';
import { type PlayingCardValue, Rank, Suit } from '~/types/cards';

const LOADING_TICK_RATE_MS = 300;

const loadingState = [
  {
    card: null,
    offScreen: false,
  },
  {
    card: null,
    offScreen: false,
  },
  {
    card: {
      suit: Suit.SPADES,
      rank: Rank.ACE,
    },
    offScreen: false,
  },
  {
    card: {
      suit: Suit.SPADES,
      rank: Rank.ACE,
    },
    offScreen: false,
  },
  {
    card: {
      suit: Suit.SPADES,
      rank: Rank.ACE,
    },
    offScreen: false,
  },
  {
    card: {
      suit: Suit.SPADES,
      rank: Rank.ACE,
    },
    offScreen: false,
  },
  {
    card: {
      suit: Suit.SPADES,
      rank: Rank.ACE,
    },
    offScreen: true,
  },
  {
    card: null,
    offScreen: true,
  },
  {
    card: null,
    offScreen: false,
  },
  {
    card: null,
    offScreen: false,
  },
  {
    card: {
      suit: Suit.HEARTS,
      rank: Rank.QUEEN,
    },
    offScreen: false,
  },
  {
    card: {
      suit: Suit.HEARTS,
      rank: Rank.QUEEN,
    },
    offScreen: false,
  },
  {
    card: {
      suit: Suit.HEARTS,
      rank: Rank.QUEEN,
    },
    offScreen: false,
  },
  {
    card: {
      suit: Suit.HEARTS,
      rank: Rank.QUEEN,
    },
    offScreen: false,
  },
  {
    card: {
      suit: Suit.HEARTS,
      rank: Rank.QUEEN,
    },
    offScreen: true,
  },
  {
    card: null,
    offScreen: true,
  },
  {
    card: null,
    offScreen: false,
  },
  {
    card: null,
    offScreen: false,
  },
  {
    card: {
      suit: Suit.CLUBS,
      rank: Rank.TWO,
    },
    offScreen: false,
  },
  {
    card: {
      suit: Suit.CLUBS,
      rank: Rank.TWO,
    },
    offScreen: false,
  },
  {
    card: {
      suit: Suit.CLUBS,
      rank: Rank.TWO,
    },
    offScreen: false,
  },
  {
    card: {
      suit: Suit.CLUBS,
      rank: Rank.TWO,
    },
    offScreen: false,
  },
  {
    card: {
      suit: Suit.CLUBS,
      rank: Rank.TWO,
    },
    offScreen: true,
  },
  {
    card: null,
    offScreen: true,
  },
  {
    card: null,
    offScreen: false,
  },
  {
    card: null,
    offScreen: false,
  },
  {
    card: {
      suit: Suit.DIAMONDS,
      rank: Rank.JACK,
    },
    offScreen: false,
  },
  {
    card: {
      suit: Suit.DIAMONDS,
      rank: Rank.JACK,
    },
    offScreen: false,
  },
  {
    card: {
      suit: Suit.DIAMONDS,
      rank: Rank.JACK,
    },
    offScreen: false,
  },
  {
    card: {
      suit: Suit.DIAMONDS,
      rank: Rank.JACK,
    },
    offScreen: false,
  },
  {
    card: {
      suit: Suit.DIAMONDS,
      rank: Rank.JACK,
    },
    offScreen: true,
  },
  {
    card: null,
    offScreen: true,
  },
] as const satisfies { card: PlayingCardValue | null; offScreen: boolean }[];

export default function Loading() {
  const [loadingStateIndex, setLoadingStateIndex] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      setLoadingStateIndex((loadingStateIndex + 1) % loadingState.length);
    }, LOADING_TICK_RATE_MS);
  }, [loadingStateIndex]);

  return (
    <div className='flex flex-col items-center justify-center size-full gap-4'>
      <div
        className={`duration-300 ${loadingState[loadingStateIndex]?.offScreen ? 'opacity-0' : ''}`}
      >
        <PlayingCard card={loadingState[loadingStateIndex]?.card ?? null} />
      </div>
      <span className='text-lg font-semibold text-white'>Loading...</span>
    </div>
  );
}
