import { PlayingCard } from '~/components/ui/playing-card';
import { Rank, Suit } from '~/types/cards';

export function HighCardThumbnail() {
  return (
    <div
      role='img'
      aria-label='A four of diamonds losing to an ace of spades'
      className='flex items-center gap-1.5 text-dark-text select-none cursor-default'
    >
      <PlayingCard
        card={{ rank: Rank.FOUR, suit: Suit.DIAMONDS }}
        className='text-2xl'
        design='default'
      />
      <span className='text-5xl'>&lt;</span>
      <PlayingCard
        card={{ rank: Rank.ACE, suit: Suit.SPADES }}
        className='text-2xl'
        design='default'
      />
    </div>
  );
}
