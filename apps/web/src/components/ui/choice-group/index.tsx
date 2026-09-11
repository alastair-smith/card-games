'use client';

import { Radio as RadioPrimitive } from '@base-ui/react/radio';
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group';
import type { ReactNode } from 'react';
import { Label } from '~/components/ui/label';
import { cn } from '~/utils/cn';

type ChoiceGroupProps = {
  /** Accessible name for the group, e.g. "Game mode". */
  label: string;
  /** The selected value, for a controlled group. */
  value?: string;
  /** The initially selected value, for an uncontrolled group. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Turns off selection for every card in the group. */
  isDisabled?: boolean;
  className?: string;
  children: ReactNode;
};

/** Choose an option via radio-like cards. */
export function ChoiceGroup({
  label,
  value,
  defaultValue,
  onValueChange,
  isDisabled = false,
  className,
  children,
}: ChoiceGroupProps) {
  return (
    <RadioGroupPrimitive
      data-slot='choice-group'
      aria-label={label}
      value={value}
      defaultValue={defaultValue}
      disabled={isDisabled}
      className={cn('grid w-full gap-3', className)}
      onValueChange={(newValue: string) => onValueChange?.(newValue)}
    >
      {children}
    </RadioGroupPrimitive>
  );
}

type ChoiceCardProps = {
  /** The value this card selects within its group. */
  value: string;
  /** Turns off selection for this card only. */
  isDisabled?: boolean;
  className?: string;
  children: ReactNode;
};

/** Clickable choice within a {@link ChoiceGroup}. */
export function ChoiceCard({
  value,
  isDisabled = false,
  className,
  children,
}: ChoiceCardProps) {
  return (
    <Label
      data-slot='choice-card'
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-lg border-2 border-border bg-input-background p-4 text-base leading-normal text-light-text transition-colors has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-data-checked:border-dark-yellow has-data-checked:bg-primary/25 has-data-disabled:cursor-not-allowed has-data-disabled:opacity-50',
        className,
      )}
    >
      <RadioPrimitive.Root
        data-slot='choice-card-radio'
        value={value}
        disabled={isDisabled}
        className='relative mt-1 flex aspect-square size-4 shrink-0 rounded-full border border-border outline-none'
      >
        <RadioPrimitive.Indicator className='flex size-4 items-center justify-center'>
          <span className='absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-light-text' />
        </RadioPrimitive.Indicator>
      </RadioPrimitive.Root>
      <span className='flex flex-col gap-1'>{children}</span>
    </Label>
  );
}

type ChoiceCardTextProps = {
  className?: string;
  children: ReactNode;
};

export function ChoiceCardTitle({ className, children }: ChoiceCardTextProps) {
  return (
    <span
      data-slot='choice-card-title'
      className={cn('font-semibold', className)}
    >
      {children}
    </span>
  );
}

export function ChoiceCardDescription({
  className,
  children,
}: ChoiceCardTextProps) {
  return (
    <span
      data-slot='choice-card-description'
      className={cn('text-sm text-light-text-disabled', className)}
    >
      {children}
    </span>
  );
}
