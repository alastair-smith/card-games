import { PlayingCard } from '~/components/ui/playing-card';
import { Rank, Suit } from '~/types/cards';

export function YanivThumbnail() {
  return (
    <div
      role='img'
      aria-label='A two of diamonds plus a three of spades is less than or equal to seven'
      className='flex items-center gap-1 text-dark-text select-none cursor-default'
    >
      <PlayingCard
        card={{ rank: Rank.TWO, suit: Suit.DIAMONDS }}
        className='text-xl'
        design='default'
      />
      <span className='text-4xl'>+</span>
      <PlayingCard
        card={{ rank: Rank.THREE, suit: Suit.SPADES }}
        className='text-xl'
        design='default'
      />
      <span className='text-4xl'>&le;</span>
      <span className='text-4xl'>7</span>
    </div>
  );
}
