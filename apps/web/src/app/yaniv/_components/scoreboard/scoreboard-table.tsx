import { useLayoutEffect, useRef } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { cn } from '~/utils/cn';
import { RoundPoints } from './round-points';
import type { ScoreboardRow } from './rows';

const backgroundClassName =
  'bg-[var(--scoreboard-background,var(--color-main-background))]';

const pinnedClassName = cn('sticky z-10', backgroundClassName);

const pinnedStartClassName = cn(
  pinnedClassName,
  'left-0 after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-current/30',
);

const pinnedEndClassName = cn(
  pinnedClassName,
  'right-0 before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-current/30',
);

type ScoreboardTableProps = {
  className?: string;
  rows: ScoreboardRow[];
  roundNumbers: number[];
  isExpanded: boolean;
};

export function ScoreboardTable({
  className,
  rows,
  roundNumbers,
  isExpanded,
}: ScoreboardTableProps) {
  const tableRef = useRef<HTMLTableElement>(null);

  useLayoutEffect(() => {
    const scroller = tableRef.current?.parentElement;
    if (isExpanded && roundNumbers.length > 0 && scroller) {
      scroller.scrollLeft = scroller.scrollWidth;
    }
  }, [isExpanded, roundNumbers.length]);

  return (
    <Table
      ref={tableRef}
      rootClassName={cn('overscroll-x-none', backgroundClassName, className)}
      className='tabular-nums'
    >
      <TableHeader className='[&_tr]:border-current/30'>
        <TableRow className='hover:bg-transparent'>
          <TableHead
            className={cn(
              'h-auto px-2 py-2 text-current',
              pinnedStartClassName,
            )}
          >
            Player
          </TableHead>
          {roundNumbers.map((roundNumber) => (
            <TableHead
              key={roundNumber}
              aria-label={`Round ${roundNumber}`}
              className='h-auto px-2 py-2 text-center text-current opacity-70 whitespace-nowrap'
            >
              {isExpanded ? roundNumber : `Round ${roundNumber}`}
            </TableHead>
          ))}
          <TableHead
            className={cn(
              'h-auto px-2 py-2 text-right text-current',
              pinnedEndClassName,
            )}
          >
            Total
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {rows.map(({ id, name, score, isUser, roundScores }) => (
          <TableRow
            key={id}
            className={cn(
              'border-current/15 hover:bg-transparent',
              isUser && 'font-bold',
            )}
          >
            <TableCell
              className={cn(
                'px-2 py-2 whitespace-nowrap',
                pinnedStartClassName,
              )}
            >
              {name}
              {isUser && ' (You)'}
            </TableCell>
            {roundNumbers.map((roundNumber) => {
              const roundScore = roundScores[roundNumber - 1];
              return (
                <TableCell key={roundNumber} className='px-2 py-2 text-center'>
                  {roundScore && <RoundPoints roundScore={roundScore} />}
                </TableCell>
              );
            })}
            <TableCell
              className={cn(
                'px-2 py-2 text-right text-base font-extrabold',
                pinnedEndClassName,
              )}
            >
              {score}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
