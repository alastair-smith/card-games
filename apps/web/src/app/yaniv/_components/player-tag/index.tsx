import type { ComponentProps } from 'react';
import { PlayerTag as BasePlayerTag } from '~/components/player-tag';

type PlayerTagProps = Omit<
  ComponentProps<typeof BasePlayerTag>,
  'children' | 'cardCount'
> & {
  cardCount: number;
  isYanivCalled: boolean;
};

/** A player's tag, with a sticker once they've called Yaniv. */
export function PlayerTag({ isYanivCalled, ...tagProps }: PlayerTagProps) {
  return (
    <BasePlayerTag {...tagProps}>
      {isYanivCalled && (
        <>
          <span
            aria-hidden='true'
            // Above the turn brackets of the tag next to it
            className='absolute -top-3 -right-4 z-10 rotate-12 rounded-sm border-2 border-black bg-true-white px-1 text-xs font-black uppercase text-slate'
          >
            Yaniv!
          </span>
          <span className='sr-only'>, has called Yaniv</span>
        </>
      )}
    </BasePlayerTag>
  );
}
