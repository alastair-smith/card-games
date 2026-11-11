import type { ComponentProps } from 'react';
import { PlayerTag } from '~/components/player-tag';
import type { FinishingPosition, TableCardSlot } from '~/types/games/shithead';
import { cn } from '~/utils/cn';
import { TableCards } from '../table-cards';

const FINISHING_POSITIONS = {
  1: { label: '1st', medal: '🥇' },
  2: { label: '2nd', medal: '🥈' },
  3: { label: '3rd', medal: '🥉' },
  4: { label: '4th', medal: null },
  5: { label: '5th', medal: null },
} as const satisfies Record<
  FinishingPosition,
  { label: string; medal: string | null }
>;

type PlayerAreaProps = Omit<
  ComponentProps<typeof PlayerTag>,
  'children' | 'cardCount'
> & {
  cardCount: number;
  tableCards: TableCardSlot[];
  finishingPosition: FinishingPosition | null;
};

/** A player's tag above their cards on the table, or where they finished. */
export function PlayerArea({
  className,
  cardCount,
  tableCards,
  finishingPosition,
  isPlayersTurn,
  ...tagProps
}: PlayerAreaProps) {
  const isFinished = finishingPosition !== null;

  return (
    <div className={cn('flex w-fit flex-col items-center gap-2', className)}>
      <PlayerTag
        {...tagProps}
        cardCount={isFinished ? null : cardCount}
        isPlayersTurn={isPlayersTurn}
      />
      {isPlayersTurn && <span className='sr-only'>, their turn</span>}
      <div className='relative'>
        <TableCards slots={tableCards} />
        {isFinished && <FinishedBadge position={finishingPosition} />}
      </div>
    </div>
  );
}

function FinishedBadge({ position }: { position: FinishingPosition }) {
  const { label, medal } = FINISHING_POSITIONS[position];

  return (
    <div className='absolute inset-0 flex flex-col items-center justify-center font-black text-white text-outline-black'>
      {medal && (
        <span aria-hidden='true' className='text-3xl sm:text-5xl'>
          {medal}
        </span>
      )}
      <span className='text-xl sm:text-3xl'>
        <span className='sr-only'>Finished </span>
        {label}
      </span>
    </div>
  );
}
