import type { ReactNode } from 'react';
import {
  PLAYING_CARD_DEFAULT_SIZE,
  PLAYING_CARD_PROPORTIONS,
  PlayingCard,
} from '~/components/ui/playing-card';
import { cn } from '~/utils/cn';

type PlayingCardDeckProps = {
  className?: string;
  fontSize?: `text-${string}`;
};

export function PlayingCardDeck({
  className,
  fontSize = PLAYING_CARD_DEFAULT_SIZE,
}: PlayingCardDeckProps) {
  return (
    <div
      className={cn(
        'relative w-fit pt-[0.56em] pr-[0.44em]',
        fontSize,
        className,
      )}
    >
      <div className='w-fit relative'>
        <div className='w-[3.75em] h-[5.25em] absolute inset-0 translate-x-[0.32em] -translate-y-[0.44em] rounded-[0.22em] border-[0.056em] border-border/50 bg-white' />
        <div className='w-[3.75em] h-[5.25em] absolute inset-0 translate-x-[0.24em] -translate-y-[0.33em] rounded-[0.22em] border-[0.056em] border-border/50 bg-white' />
        <div className='w-[3.75em] h-[5.25em] absolute inset-0 translate-x-[0.16em] -translate-y-[0.22em] rounded-[0.22em] border-[0.056em] border-border/50 bg-white' />
        <div className='w-[3.75em] h-[5.25em] absolute inset-0 translate-x-[0.08em] -translate-y-[0.11em] rounded-[0.22em] border-[0.056em] border-border/50 bg-white' />
        <div className='w-[3.75em] h-[5.25em] relative'>
          <PlayingCard
            card={null}
            className={fontSize}
            cardClassName='border-[0.056em] border-border/50'
          />
        </div>
      </div>
    </div>
  );
}

type PlayingCardDiscardPile = {
  className?: string;
  children?: ReactNode;
};

export function PlayingCardDiscardPile({
  className,
  children,
}: PlayingCardDiscardPile) {
  return (
    <div
      className={cn(
        PLAYING_CARD_DEFAULT_SIZE,
        PLAYING_CARD_PROPORTIONS,
        'border-[0.056em] rounded-[0.22em] bg-white/20 border-white',
        className,
      )}
    >
      {children}
    </div>
  );
}
