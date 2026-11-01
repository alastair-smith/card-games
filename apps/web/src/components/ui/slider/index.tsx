'use client';

import { Slider as SliderPrimitive } from '@base-ui/react/slider';
import { cn } from '~/utils/cn';

type SliderProps = {
  label: string;
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number) => void;
  isDisabled?: boolean;
  className?: string;
};

/** Pick a number from a range, showing the value beside the label. */
export function Slider({
  label,
  value,
  defaultValue,
  min,
  max,
  step,
  onValueChange,
  isDisabled = false,
  className,
}: SliderProps) {
  return (
    <SliderPrimitive.Root
      data-slot='slider'
      value={value}
      defaultValue={defaultValue}
      min={min}
      max={max}
      step={step}
      disabled={isDisabled}
      // Leaves out base-ui's event details, so callers get just the value
      onValueChange={(newValue) => onValueChange?.(newValue)}
      className={cn(
        'flex w-full flex-col gap-2 data-disabled:opacity-50',
        className,
      )}
    >
      <div className='flex items-center justify-between gap-3'>
        <SliderPrimitive.Label className='font-semibold'>
          {label}
        </SliderPrimitive.Label>
        <SliderPrimitive.Value className='text-xl font-semibold tabular-nums' />
      </div>
      <SliderPrimitive.Control className='flex h-8 w-full touch-none items-center select-none data-disabled:cursor-not-allowed'>
        <SliderPrimitive.Track className='h-3 w-full rounded-full border-2 border-border bg-input-background'>
          <SliderPrimitive.Indicator className='rounded-full bg-primary' />
          <SliderPrimitive.Thumb className='size-6 rounded-full border-2 border-border bg-light-text outline-none has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2' />
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}
