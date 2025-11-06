import type { ReactNode } from 'react';
import { MIN_CARD_HEIGHT } from '~/components/ui/playing-card';
import { cn } from '~/utils/cn';

export type HandProps = {
  children?: ReactNode;
  className?: string;
};
export function HorizontalHand({ children, className }: HandProps) {
  return (
    <div>
      <div className={cn('border-t-2', 'text-4xl', className)}>
        <h2 className='text-base'>Your hand</h2>
        <div
          className={cn(
            'flex w-full items-center justify-center pt-3',
            MIN_CARD_HEIGHT,
          )}
        >
          {children}
          {!children && <div className='text-4xl'>[ Empty Hand ]</div>}
        </div>
      </div>
    </div>
  );
}

export function VerticalHand({ children, className }: HandProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap w-full h-full items-center justify-center pt-3',
        className,
      )}
    >
      {children}
      {!children && <div className='text-4xl'>[ Empty Hand ]</div>}
    </div>
  );
}
