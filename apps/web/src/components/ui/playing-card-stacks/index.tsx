import type { ReactElement, ReactNode } from 'react';
import {
  PLAYING_CARD_MIN_PROPORTIONS,
  PLAYING_CARD_PROPORTIONS,
  PlayingCard,
} from '~/components/ui/playing-card';
import { cn } from '~/utils/cn';

type PlayingCardDeckProps = {
  className?: string;
};

export function PlayingCardDeck({ className }: PlayingCardDeckProps) {
  return (
    <div className={cn('relative w-fit pt-[0.56em] pr-[0.44em]', className)}>
      <div className='w-fit relative'>
        <div className='w-[3.75em] h-[5.25em] absolute inset-0 translate-x-[0.32em] -translate-y-[0.44em] rounded-[0.22em] border-[0.056em] border-border/50 bg-white' />
        <div className='w-[3.75em] h-[5.25em] absolute inset-0 translate-x-[0.24em] -translate-y-[0.33em] rounded-[0.22em] border-[0.056em] border-border/50 bg-white' />
        <div className='w-[3.75em] h-[5.25em] absolute inset-0 translate-x-[0.16em] -translate-y-[0.22em] rounded-[0.22em] border-[0.056em] border-border/50 bg-white' />
        <div className='w-[3.75em] h-[5.25em] absolute inset-0 translate-x-[0.08em] -translate-y-[0.11em] rounded-[0.22em] border-[0.056em] border-border/50 bg-white' />
        <div className='w-[3.75em] h-[5.25em] relative'>
          <PlayingCard
            card={null}
            cardClassName='border-[0.056em] border-border/50'
            border
          />
        </div>
      </div>
    </div>
  );
}

type PlayingCardStack = {
  className?: string;
  children?:
    | ReactElement<typeof PlayingCard>
    | ReactElement<typeof PlayingCard>[]
    | false;
};

export function PlayingCardStack({ className, children }: PlayingCardStack) {
  return (
    <div className={className}>
      <div
        className={cn(
          PLAYING_CARD_MIN_PROPORTIONS,
          'flex *:-ml-[1.44em] *:first:ml-0',
        )}
      >
        {children}
      </div>
    </div>
  );
}

type PlayingCardDiscardPile = {
  className?: string;
  children?: ReactNode;
};

/**
 * Pass visible cards as children
 */
export function PlayingCardDiscardPile({
  className,
  children,
}: PlayingCardDiscardPile) {
  return (
    <div
      className={cn(
        'border-[0.056em] rounded-[0.22em] bg-white/20 border-white p-2 w-fit',
        className,
      )}
    >
      <div className={PLAYING_CARD_PROPORTIONS}>{children}</div>
    </div>
  );
}
