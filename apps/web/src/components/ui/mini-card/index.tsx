import type { ComponentProps } from 'react';
import { cn } from '~/utils/cn';

type MiniCardProps = ComponentProps<'span'> & {
  isHighlighted?: boolean;
};

export function MiniCard({
  className,
  isHighlighted = false,
  ...props
}: MiniCardProps) {
  return (
    <span
      className={cn(
        // Wide enough for two digits, in a playing card's proportions
        'grid aspect-5/7 w-[1.5em] place-items-center rounded-[3px] border border-black/40 bg-true-white font-bold text-slate',
        isHighlighted && 'bg-yellow',
        className,
      )}
      {...props}
    />
  );
}
