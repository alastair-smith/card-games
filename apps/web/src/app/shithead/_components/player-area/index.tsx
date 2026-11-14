import type { ComponentProps } from 'react';
import { PlayerTag } from '~/components/player-tag';
import type { FinishingPosition, TableCardSlot } from '~/types/games/shithead';
import { cn } from '~/utils/cn';
import { FINISHING_POSITIONS } from '~/utils/shithead/finishing-positions';
import { TableCards } from '../table-cards';

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
  isUser,
  ...tagProps
}: PlayerAreaProps) {
  const isFinished = finishingPosition !== null;

  return (
    <div className={cn('flex w-fit flex-col items-center gap-2', className)}>
      <PlayerTag
        {...tagProps}
        // Fits a name of the longest length in the widest letter, with the
        // card count wrapping below it, so smaller screens fit two players a
        // row. Your own tag also has the user icon
        className={cn(
          isUser ? 'max-w-[10.9rem]' : 'max-w-[9.75rem]',
          'sm:max-w-none',
        )}
        isUser={isUser}
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
