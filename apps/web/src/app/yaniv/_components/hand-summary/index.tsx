import { cn } from '~/utils/cn';

type HandSummaryProps = {
  className?: string;
  handTotal: number;
  isHandTotalHidden: boolean;
  totalScore: number;
  isFiftyScoreHalved: boolean;
};

function getHalvingNote(totalScore: number, isFiftyScoreHalved: boolean) {
  const target = !isFiftyScoreHalved && totalScore < 50 ? 50 : 100;
  const away = target - totalScore;
  return `${Math.abs(away)} points ${away >= 0 ? 'to' : 'past'} ${target}`;
}

/** Your hand total, how far you are from halving at 50 or 100, and your score. */
export function HandSummary({
  className,
  handTotal,
  isHandTotalHidden,
  totalScore,
  isFiftyScoreHalved,
}: HandSummaryProps) {
  return (
    <dl
      className={cn(
        // Equal outer columns keep the middle item centred
        'm-0 grid grid-cols-[1fr_auto_1fr] items-baseline gap-x-3 text-sm text-dark-text',
        className,
      )}
    >
      <div className='flex items-baseline gap-1'>
        <dt>Hand</dt>
        {/* Both stay in the same grid cell, so hiding the total doesn't move
            the text around it */}
        <dd className='m-0 grid text-2xl/none font-extrabold'>
          <output
            aria-label='Hand total'
            className={cn(
              '[grid-area:1/1] text-center',
              isHandTotalHidden && 'invisible',
            )}
          >
            {handTotal}
          </output>
          <span
            className={cn(
              '[grid-area:1/1] text-center',
              !isHandTotalHidden && 'invisible',
            )}
          >
            ?<span className='sr-only'>, hidden</span>
          </span>
        </dd>
      </div>
      <div className='flex items-baseline'>
        <dt className='sr-only'>Until halving</dt>
        <dd className='m-0 text-dark-text-disabled'>
          {getHalvingNote(totalScore, isFiftyScoreHalved)}
        </dd>
      </div>
      <div className='flex items-baseline gap-1 justify-self-end'>
        <dt>Total</dt>
        <dd className='m-0 text-2xl/none font-extrabold'>{totalScore}</dd>
      </div>
    </dl>
  );
}
