import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { cn } from '~/utils/cn';

type ToggleVisibilityButtonProps = {
  className?: string;
  isFaceDown: boolean;
  onClick: () => void;
};

/** Turns your cards face down, for when someone could see your screen. */
export function ToggleVisibilityButton({
  className,
  isFaceDown,
  onClick,
}: ToggleVisibilityButtonProps) {
  return (
    <Button
      size='sm'
      variant='secondary'
      onClick={onClick}
      className={cn('shrink-0', className)}
    >
      {isFaceDown ? <EyeIcon /> : <EyeOffIcon />}
      Toggle visibility
      <span className='sr-only'>
        , your cards are {isFaceDown ? 'face down' : 'face up'}
      </span>
    </Button>
  );
}
