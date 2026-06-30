import { cn } from '~/utils/cn';
import { type PlayerColor, playerColorValue } from '~/utils/player-color';

type HandTotalProps = {
  className?: string;
  color: PlayerColor;
  handTotal: number;
  isFiftyScoreHalved: boolean;
  totalScore: number;
};

export default function HandTotal({
  className,
  color,
  handTotal,
  isFiftyScoreHalved,
  totalScore,
}: HandTotalProps) {
  const scoreNote =
    !isFiftyScoreHalved && totalScore < 50
      ? { target: 50, away: 50 - totalScore }
      : { target: 100, away: 100 - totalScore };

  return (
    <div
      style={{ backgroundColor: playerColorValue(color) }}
      className={cn(
        'flex flex-col rounded p-2 h-fit text-white font-extrabold text-outline-black',
        className,
      )}
    >
      <div className='flex flex-col items-end'>
        <div>Hand total:</div>
        <output aria-label='Hand total' className='min-w-[2ch] text-2xl'>
          {handTotal}
        </output>
      </div>
      <div className='text-sm flex flex-col items-end'>
        <span>Total score:</span>
        <span>
          {Math.abs(scoreNote.away)}
          {scoreNote.away >= 0 ? ' away from ' : ' beyond '}
          {scoreNote.target}.
        </span>
      </div>
    </div>
  );
}
