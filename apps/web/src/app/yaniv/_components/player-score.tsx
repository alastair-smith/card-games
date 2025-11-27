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
    <div className='flex justify-between px-3 text-lg w-full gap-1 items-stretch'>
      <div className='bg-alt-background rounded-lg py-0.5 px-1 flex-1'>
        {scoreHistory.map(({ number, scoreHalved }, index) => (
          <>
            <span
              className={cn(
                scoreHalved
                  ? 'px-1 rounded-full bg-white text-alt-background font-semibold'
                  : '',
              )}
            >
              {number}
            </span>
            {index !== scoreHistory.length - 1 && <span>, </span>}
          </>
        ))}
      </div>
      <div className='whitespace-nowrap bg-alt-background rounded-lg py-0.5 px-1 flex items-center justify-center'>
        <span className=''>
          {handSize === 1 ? `1 card` : `${handSize} cards`}
        </span>
      </div>
    </div>
  );
}
