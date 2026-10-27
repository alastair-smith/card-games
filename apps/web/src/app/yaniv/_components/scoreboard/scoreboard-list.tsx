import { cn } from '~/utils/cn';
import { RoundPoints } from './round-points';
import type { ScoreboardRow } from './rows';

type ScoreboardListProps = {
  className?: string;
  rows: ScoreboardRow[];
  roundNumbers: number[];
  isExpanded: boolean;
};

export function ScoreboardList({
  className,
  rows,
  roundNumbers,
  isExpanded,
}: ScoreboardListProps) {
  return (
    <ol
      aria-label='Scoreboard'
      className={cn('flex flex-col tabular-nums', className)}
    >
      {rows.map(({ id, name, score, isUser, roundScores }) => (
        <li
          key={id}
          className={cn(
            // One line per player where it fits; a long name keeps its full
            // width and moves the points to a second line
            'flex flex-wrap items-baseline gap-x-2 gap-y-1 border-b border-current/15 py-2.5 last:border-0',
            isUser && 'font-bold',
          )}
        >
          <span className='shrink-0'>
            {name}
            {isUser && ' (You)'}
          </span>

          <div className='flex flex-1 items-start justify-between gap-2 text-sm'>
            <ul className='flex flex-wrap gap-x-1.5 gap-y-1'>
              {roundNumbers.map((roundNumber, index) => {
                const roundScore = roundScores[roundNumber - 1];
                return (
                  <li key={roundNumber} className='whitespace-nowrap'>
                    {index > 0 && (
                      <span aria-hidden='true' className='mr-1.5 opacity-50'>
                        ·
                      </span>
                    )}
                    <span
                      className={cn(
                        'text-dark-text-disabled',
                        isExpanded && 'sr-only',
                      )}
                    >
                      Round {roundNumber}:
                    </span>{' '}
                    {roundScore && <RoundPoints roundScore={roundScore} />}
                  </li>
                );
              })}
            </ul>

            <span className='shrink-0 whitespace-nowrap'>
              <span className='text-dark-text-disabled'>Total:</span>{' '}
              <span className='text-base font-extrabold'>{score}</span>
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
}
