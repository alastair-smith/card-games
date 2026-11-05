import type { ComponentProps } from 'react';
import { MiniCard } from '~/components/ui/mini-card';
import { SpinButton } from '~/components/ui/spin-button';
import { cn } from '~/utils/cn';

type RangeProps = ComponentProps<'fieldset'> & {
  isDisabled?: boolean;
  label: string;
  max: number;
  min: number;
  onRangeChange: (newValue: [number, number]) => void;
  range: [number, number];
};

export const Range = ({
  className,
  isDisabled = false,
  label,
  max,
  min,
  onRangeChange,
  range: [lowerValue, upperValue],
  ...props
}: RangeProps) => {
  return (
    <fieldset
      disabled={isDisabled}
      className={cn(
        'flex w-fit flex-col items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <legend className='sr-only'>{label}</legend>
      {/* The spin buttons give the same values to screen readers */}
      <div
        aria-hidden='true'
        className='flex w-full justify-between gap-1 text-xs'
      >
        {Array.from({ length: max }, (_, index) => index + 1).map((value) => (
          <MiniCard
            key={value}
            isHighlighted={value >= lowerValue && value <= upperValue}
          >
            {value}
          </MiniCard>
        ))}
      </div>
      <div className='flex w-full justify-between'>
        <SpinButton
          label='Min'
          value={lowerValue}
          min={min}
          max={upperValue}
          isDisabled={isDisabled}
          onValueChange={(value) => onRangeChange([value, upperValue])}
        />
        <SpinButton
          label='Max'
          value={upperValue}
          min={lowerValue}
          max={max}
          isDisabled={isDisabled}
          onValueChange={(value) => onRangeChange([lowerValue, value])}
        />
      </div>
    </fieldset>
  );
};
