import { PlayingCard } from '~/components/ui/playing-card';
import { Rank, Suit } from '~/types/cards';
import { cn } from '~/utils/cn';

/** Sized from its font size, so `className` can scale it, e.g. `text-sm`. */
export function YanivThumbnail({ className }: { className?: string }) {
  return (
    <div
      role='img'
      aria-label='A two of diamonds plus a three of spades is less than or equal to seven'
      className={cn(
        'flex items-center gap-[0.2em] text-xl text-dark-text select-none cursor-default',
        className,
      )}
    >
      <PlayingCard
        card={{ rank: Rank.TWO, suit: Suit.DIAMONDS }}
        className='text-[1em]'
        design='default'
      />
      <span className='text-[1.8em]'>+</span>
      <PlayingCard
        card={{ rank: Rank.THREE, suit: Suit.SPADES }}
        className='text-[1em]'
        design='default'
      />
      <span className='text-[1.8em]'>&le;</span>
      <span className='text-[1.8em]'>7</span>
    </div>
  );
}
