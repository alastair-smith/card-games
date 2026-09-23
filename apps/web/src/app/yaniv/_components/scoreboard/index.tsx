import { ChevronsLeftIcon, ChevronsRightIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import type { UserId } from '~/types/entities';
import { cn } from '~/utils/cn';
import { type ScoreboardPlayer, toScoreboardRows } from './rows';
import { ScoreboardList } from './scoreboard-list';
import { ScoreboardTable } from './scoreboard-table';

type ScoreboardProps = {
  className?: string;
  players: ScoreboardPlayer[];
  userId: UserId;
  isInitiallyExpanded?: boolean;
};

export function Scoreboard({
  className,
  players,
  userId,
  isInitiallyExpanded = false,
}: ScoreboardProps) {
  const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded);

  const rows = toScoreboardRows(players, userId);
  const roundCount = Math.max(
    0,
    ...players.map((player) => player.roundScores.length),
  );
  const roundNumbers = Array.from(
    { length: roundCount },
    (_, index) => index + 1,
  ).slice(isExpanded ? 0 : -1);

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <ScoreboardList
        className='sm:hidden'
        rows={rows}
        roundNumbers={roundNumbers}
        isExpanded={isExpanded}
      />
      <ScoreboardTable
        className='hidden sm:block'
        rows={rows}
        roundNumbers={roundNumbers}
        isExpanded={isExpanded}
      />

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
