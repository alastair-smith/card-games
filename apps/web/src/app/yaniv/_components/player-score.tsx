import type { ScoreHistory } from '~/types/games/yaniv';
import { cn } from '~/utils/cn';

export function PlayerScore({
  scoreHistory,
  handSize,
}: {
  scoreHistory: ScoreHistory;
  handSize: number;
}) {
  return (
    <div className='flex justify-between px-4 text-lg w-full'>
      <div>
        {scoreHistory.map(({ number, scoreHalved }, index) => (
          <>
            <span
              className={cn(scoreHalved ? 'px-1 rounded-full border-2' : '')}
            >
              {number}
            </span>
            {index !== scoreHistory.length - 1 && <span>, </span>}
          </>
        ))}
      </div>
      <span>{handSize === 1 ? `1 card` : `${handSize} cards`}</span>
    </div>
  );
}
