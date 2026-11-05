'use client';

import { Radio as RadioPrimitive } from '@base-ui/react/radio';
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group';
import { createContext, type ReactNode, useContext, useState } from 'react';
import { Label } from '~/components/ui/label';
import { cn } from '~/utils/cn';

const SelectedValueContext = createContext<string | undefined>(undefined);

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
  // Tracked so a card can open its panel in an uncontrolled group too
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);

  return (
    <RadioGroupPrimitive
      data-slot='choice-group'
      aria-label={label}
      value={value}
      defaultValue={defaultValue}
      disabled={isDisabled}
      className={cn('grid w-full gap-3', className)}
      onValueChange={(newValue: string) => {
        setUncontrolledValue(newValue);
        onValueChange?.(newValue);
      }}
    >
      <SelectedValueContext value={value ?? uncontrolledValue}>
        {children}
      </SelectedValueContext>
    </RadioGroupPrimitive>
  );
}

type ChoiceCardProps = {
  /** The value this card selects within its group. */
  value: string;
  /** Turns off selection for this card only. */
  isDisabled?: boolean;
  /** More settings for this choice, opened below it while it's selected. */
  panel?: ReactNode;
  className?: string;
  children: ReactNode;
};

/** Clickable choice within a {@link ChoiceGroup}. */
export function ChoiceCard({
  value,
  isDisabled = false,
  panel,
  className,
  children,
}: ChoiceCardProps) {
  const isSelected = useContext(SelectedValueContext) === value;

  return (
    // Disabled, the box fades its colours rather than its opacity, so a panel
    // shows its own disabled state instead of fading twice
    <div
      data-slot='choice-card'
      className={cn(
        'flex flex-col rounded-lg border-2 border-border bg-input-background text-light-text transition-colors has-[[data-slot=choice-card-radio]:focus-visible]:ring-4 has-[[data-slot=choice-card-radio]:focus-visible]:ring-ring has-[[data-slot=choice-card-radio]:focus-visible]:ring-offset-2 has-[[data-slot=choice-card-radio][data-checked]]:border-dark-yellow has-[[data-slot=choice-card-radio][data-checked]]:bg-primary/25 has-[[data-slot=choice-card-radio][data-disabled]]:border-border/50 has-[[data-slot=choice-card-radio][data-disabled]]:bg-input-background/50 has-[[data-slot=choice-card-radio][data-checked][data-disabled]]:border-dark-yellow/50 has-[[data-slot=choice-card-radio][data-checked][data-disabled]]:bg-primary/12',
        className,
      )}
    >
      <Label
        data-slot='choice-card-label'
        className='flex flex-1 cursor-pointer items-start gap-3 p-4 text-base leading-normal has-data-disabled:cursor-not-allowed has-data-disabled:opacity-50'
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
      {panel !== undefined && (
        // Outside the label, so its controls don't select the card. Inert
        // while closed, to keep it out of the tab order, and hidden from
        // screen readers by aria-hidden as well, as not every tool treats
        // inert content as hidden
        <div
          data-slot='choice-card-panel'
          inert={!isSelected}
          aria-hidden={!isSelected || undefined}
          className={cn(
            'grid motion-safe:transition-[grid-template-rows] motion-safe:duration-300',
            isSelected ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          )}
        >
          <div className='min-h-0 overflow-hidden'>
            <div className='mx-4 border-t-2 border-dark-yellow/40 py-4'>
              {panel}
            </div>
          </div>
        </div>
      )}
    </div>
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
