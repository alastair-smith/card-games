import { CircleIcon, CircleStarIcon, SquareIcon } from 'lucide-react';
import type { PlayerName } from '~/types/entities';
import { cn } from '~/utils/cn';

type ScoreCardProps = {
  className?: string;
  cardCount: number;
  isFiftyScoreHalved: boolean;
  isHundredScoreHalved: boolean;
  name: PlayerName;
  score: number;
};

export default function ScoreCard({
  className,
  cardCount,
  isFiftyScoreHalved,
  isHundredScoreHalved,
  name,
  score,
}: ScoreCardProps) {
  return (
    <div
      className={cn(
        'grid bg-alt-background grid-cols-2 grid-rows-[1fr_auto] rounded border-white border p-1 gap-2',
        className,
      )}
    >
      <div className='flex flex-col justify-center items-center'>
        <span className='text-2xl font-semibold'>{cardCount}</span>
        <span>cards</span>
      </div>
      <div className='grid grid-cols-2 gap-2'>
        <div className='col-span-2 justify-self-center flex flex-wrap gap-1 justify-center'>
          <div>Score: </div>
          <div className='min-w-[3ch] text-center'>{score}</div>
        </div>
        <div className='flex flex-col items-center justify-center'>
          <CircleIcon
            fill={isFiftyScoreHalved ? 'white' : 'transparent'}
            size={14}
          />

          <div className='text-sm'>
            50
            <span className='sr-only'>
              {' '}
              {isFiftyScoreHalved
                ? 'score has been halved'
                : 'score has not been halved'}
            </span>
          </div>
        </div>
        <div className='flex flex-col items-center justify-center'>
          <CircleIcon
            fill={isHundredScoreHalved ? 'white' : 'transparent'}
            size={14}
          />
          <div className='text-sm'>
            100
            <span className='sr-only'>
              {' '}
              {isHundredScoreHalved
                ? 'score has been halved'
                : 'score has not been halved'}
            </span>
          </div>
        </div>
      </div>
      <div className='col-span-2 justify-self-center border border-white rounded w-full text-center text-sm'>
        {name}
      </div>
    </div>
  );
}
