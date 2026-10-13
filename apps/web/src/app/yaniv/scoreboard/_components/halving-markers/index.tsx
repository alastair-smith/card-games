import { CircleIcon } from 'lucide-react';
import { cn } from '~/utils/cn';

type HalvingMarkersProps = {
  className?: string;
  isFiftyScoreHalved: boolean;
  isHundredScoreHalved: boolean;
};

const markerLabel = (isHalved: boolean) =>
  isHalved ? 'score has been halved' : 'score has not been halved';

/** Marks off the totals a player has already had their score halved at. */
export default function HalvingMarkers({
  className,
  isFiftyScoreHalved,
  isHundredScoreHalved,
}: HalvingMarkersProps) {
  return (
    <div className={cn('flex gap-1.5 sm:gap-2', className)}>
      <div className='flex gap-0.5 items-center justify-center'>
        <CircleIcon
          fill={isFiftyScoreHalved ? 'currentColor' : 'transparent'}
          size={12}
          strokeWidth={3}
          aria-hidden='true'
        />
        <div className='text-xs sm:text-sm' aria-hidden='true'>
          50
        </div>
        <span className='sr-only'>50 {markerLabel(isFiftyScoreHalved)}</span>
      </div>

      <div className='flex gap-0.5 items-center justify-center'>
        <CircleIcon
          fill={isHundredScoreHalved ? 'currentColor' : 'transparent'}
          size={12}
          strokeWidth={3}
          aria-hidden='true'
        />
        <div className='text-xs sm:text-sm' aria-hidden='true'>
          100
        </div>
        <span className='sr-only'>100 {markerLabel(isHundredScoreHalved)}</span>
      </div>
    </div>
  );
}
