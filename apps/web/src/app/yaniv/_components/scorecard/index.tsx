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
        'bg-alt-background rounded border-white border p-1 flex flex-col gap-1',
        className,
      )}
    >
      <div className='flex gap-1 justify-center'>
        <div className='flex flex-col justify-center items-center border-r px-2'>
          <span className='text-lg/none font-semibold'>{cardCount}</span>
          <span className='text-sm'>cards</span>
        </div>

        <div className='flex flex-col gap-1'>
          <div className='col-span-2 justify-self-center flex gap-1 justify-center text-sm'>
            <div>Score: </div>
            <div className='min-w-[3ch] text-center'>{score}</div>
          </div>

          <div className='flex justify-around gap-1'>
            <div className='flex gap-1 items-center justify-center'>
              <CircleIcon
                fill={isFiftyScoreHalved ? 'white' : 'transparent'}
                size={12}
              />
              <div className='text-xs'>
                50
                <span className='sr-only'>
                  {' '}
                  {isFiftyScoreHalved
                    ? 'score has been halved'
                    : 'score has not been halved'}
                </span>
              </div>
            </div>

            <div className='flex gap-1 items-center justify-center'>
              <CircleIcon
                fill={isHundredScoreHalved ? 'white' : 'transparent'}
                size={12}
              />
              <div className='text-xs'>
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
        </div>
      </div>

      <div className='col-span-2 justify-self-center border border-white rounded w-full text-center text-sm font-semibold'>
        {name}
      </div>
    </div>
  );
}
