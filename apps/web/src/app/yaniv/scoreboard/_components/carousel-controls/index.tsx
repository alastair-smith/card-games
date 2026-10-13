import {
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react';
import { Button } from '~/components/ui/button';

type CarouselControlsProps = {
  isAtFirst: boolean;
  isAtLast: boolean;
  onFirst: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onLast: () => void;
};

/**
 * Turns the pages of the game. Next is never disabled: pressing it when the
 * page is not finished is what asks it to say why.
 */
export default function CarouselControls({
  isAtFirst,
  isAtLast,
  onFirst,
  onPrevious,
  onNext,
  onLast,
}: CarouselControlsProps) {
  return (
    <div className='flex shrink-0 items-center justify-center gap-2'>
      <Button
        variant='secondary'
        size='icon'
        aria-label='Back to the player names'
        disabled={isAtFirst}
        onClick={onFirst}
      >
        <ChevronFirstIcon aria-hidden='true' />
      </Button>

      <Button variant='secondary' disabled={isAtFirst} onClick={onPrevious}>
        <ChevronLeftIcon aria-hidden='true' />
        Previous
      </Button>

      <Button onClick={onNext}>
        Next
        <ChevronRightIcon aria-hidden='true' />
      </Button>

      <Button
        variant='secondary'
        size='icon'
        aria-label='On to the current round'
        disabled={isAtLast}
        onClick={onLast}
      >
        <ChevronLastIcon aria-hidden='true' />
      </Button>
    </div>
  );
}
