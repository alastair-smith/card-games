import { ChevronsLeftIcon, ChevronsRightIcon } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';
import { Button } from '~/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import type { PlayerName, UserId } from '~/types/entities';
import type { RoundScore } from '~/types/games/yaniv';
import { cn } from '~/utils/cn';

const pinnedClassName = 'sticky z-10 bg-(--scoreboard-background)';

const pinnedStartClassName = cn(
  pinnedClassName,
  'left-0 after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-current/30',
);

const pinnedEndClassName = cn(
  pinnedClassName,
  'right-0 before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-current/30',
);

const toRoundChanges = (roundScores: RoundScore[]) => {
  let runningTotal = 0;
  return roundScores.map(({ adjusted, isScoreHalved }) => {
    runningTotal += adjusted;
    const halvedBy = isScoreHalved ? runningTotal / 2 : 0;
    runningTotal -= halvedBy;
    return { adjusted, halvedBy };
  });
};

type ScoreboardProps = {
  className?: string;
  players: {
    id: UserId;
    name: PlayerName;
    score: number;
    roundScores: RoundScore[];
  }[];
  userId: UserId;
};

export function Scoreboard({ className, players, userId }: ScoreboardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const tableRef = useRef<HTMLTableElement>(null);

  const sortedPlayers = [...players].sort(
    (first, second) => first.score - second.score,
  );
  const roundCount = Math.max(
    0,
    ...players.map((player) => player.roundScores.length),
  );
  const visibleRoundNumbers = Array.from(
    { length: roundCount },
    (_, index) => index + 1,
  ).slice(isExpanded ? 0 : -1);

  useLayoutEffect(() => {
    const scroller = tableRef.current?.parentElement;
    if (isExpanded && roundCount > 0 && scroller) {
      scroller.scrollLeft = scroller.scrollWidth;
    }
  }, [isExpanded, roundCount]);

  return (
    <div
      className={cn(
        '[--scoreboard-background:var(--color-main-background)] flex flex-col gap-2',
        className,
      )}
    >
      <Table
        ref={tableRef}
        rootClassName='overscroll-x-none bg-(--scoreboard-background)'
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
            {visibleRoundNumbers.map((roundNumber) => (
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
          {sortedPlayers.map(({ id, name, score, roundScores }) => {
            const roundChanges = toRoundChanges(roundScores);
            return (
              <TableRow
                key={id}
                className={cn(
                  'border-current/15 hover:bg-transparent',
                  id === userId && 'font-bold',
                )}
              >
                <TableCell
                  className={cn(
                    'px-2 py-2 whitespace-nowrap',
                    pinnedStartClassName,
                  )}
                >
                  {name}
                  {id === userId && ' (You)'}
                </TableCell>
                {visibleRoundNumbers.map((roundNumber) => {
                  const roundChange = roundChanges[roundNumber - 1];
                  return (
                    <TableCell
                      key={roundNumber}
                      className='px-2 py-2 text-center whitespace-nowrap'
                    >
                      {roundChange?.adjusted}
                      {roundChange && roundChange.halvedBy > 0 && (
                        <>
                          <span aria-hidden='true' className='ml-1 opacity-70'>
                            (−{roundChange.halvedBy})
                          </span>
                          <span className='sr-only'>
                            , score halved by {roundChange.halvedBy}
                          </span>
                        </>
                      )}
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
            );
          })}
        </TableBody>
      </Table>

      {roundCount > 1 && (
        <Button
          variant='secondary'
          size='sm'
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((previous) => !previous)}
          className='self-center'
        >
          {isExpanded ? <ChevronsRightIcon /> : <ChevronsLeftIcon />}
          {isExpanded ? 'Hide earlier rounds' : 'Show all rounds'}
        </Button>
      )}
    </div>
  );
}
