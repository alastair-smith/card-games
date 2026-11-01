import { type KeyboardEvent, useRef } from 'react';
import { Button } from '~/components/ui/button';
import { ButtonGroup } from '~/components/ui/button-group';
import { cn } from '~/utils/cn';

type SpinButtonProps = {
  className?: string;
  label: string;
  max: number;
  min: number;
  onValueChange: (value: number) => void;
  value: number;
};

export function SpinButton({
  className,
  label,
  max,
  min,
  onValueChange,
  value,
}: SpinButtonProps) {
  const spinButtonRef = useRef<HTMLSpanElement>(null);

  const changeValue = (newValue: number) => {
    const clampedValue = Math.min(max, Math.max(min, newValue));
    if (clampedValue !== value) onValueChange(clampedValue);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    const keyValues: Record<string, number> = {
      ArrowUp: value + 1,
      ArrowDown: value - 1,
      Home: min,
      End: max,
    };
    const newValue = keyValues[event.key];
    if (newValue === undefined) return;
    event.preventDefault();
    changeValue(newValue);
  };

  // Focus moves to the value so screen readers announce it, and so it isn't
  // left on a button that's just been disabled
  const handleButtonClick = (newValue: number) => {
    changeValue(newValue);
    spinButtonRef.current?.focus();
  };

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <span
        ref={spinButtonRef}
        role='spinbutton'
        tabIndex={0}
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        onKeyDown={handleKeyDown}
        className='rounded px-1 text-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring'
      >
        {label} <span className='font-bold tabular-nums'>{value}</span>
      </span>
      {/* Out of the tab order, as the arrow keys on the value do the same */}
      <ButtonGroup>
        <Button
          size='sm'
          variant='secondary'
          tabIndex={-1}
          aria-label={`Decrease ${label}`}
          disabled={value <= min}
          onClick={() => handleButtonClick(value - 1)}
        >
          -
        </Button>
        <Button
          size='sm'
          variant='secondary'
          tabIndex={-1}
          aria-label={`Increase ${label}`}
          disabled={value >= max}
          onClick={() => handleButtonClick(value + 1)}
        >
          +
        </Button>
      </ButtonGroup>
    </div>
  );
}
