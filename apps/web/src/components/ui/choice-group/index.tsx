'use client';

import { createContext, type ReactNode, useContext, useId } from 'react';
import { Label } from '~/components/ui/label';
import { cn } from '~/utils/cn';

type ChoiceGroupContextValue = {
  name: string;
  value: string | undefined;
  defaultValue: string | undefined;
  onValueChange: ((value: string) => void) | undefined;
};

const ChoiceGroupContext = createContext<ChoiceGroupContextValue | null>(null);

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

/**
 * Choose an option via cards, which are native radio inputs.
 *
 * Keep buttons, links and other controls out of a `ChoiceCard`. Each
 * card is its radio's `<label>`, so their text joins the radio's name, and
 * HTML allows no other form control inside a label.
 */
export function ChoiceGroup({
  label,
  value,
  defaultValue,
  onValueChange,
  isDisabled = false,
  className,
  children,
}: ChoiceGroupProps) {
  const name = useId();

  return (
    <ChoiceGroupContext value={{ name, value, defaultValue, onValueChange }}>
      <fieldset
        data-slot='choice-group'
        disabled={isDisabled}
        className={cn('grid w-full min-w-0 gap-3', className)}
      >
        <legend className='sr-only'>{label}</legend>
        {children}
      </fieldset>
    </ChoiceGroupContext>
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

/**
 * Clickable choice within a {@link ChoiceGroup}.
 *
 * Keep buttons, links and other controls out of a card. The card is the
 * radio's `<label>`, so their text joins the radio's name, and HTML allows no
 * other form control inside a label.
 */
export function ChoiceCard({
  value,
  isDisabled = false,
  className,
  children,
}: ChoiceCardProps) {
  const choice = useContext(ChoiceGroupContext);
  if (!choice) {
    throw new Error('ChoiceCard must be inside a ChoiceGroup');
  }

  const isControlled = choice.value !== undefined;

  return (
    <Label
      data-slot='choice-card'
      className={cn(
        'group/choice-card flex cursor-pointer items-start gap-3 rounded-lg border-2 border-border bg-input-background p-4 text-base leading-normal text-light-text has-focus-visible:ring-4 has-focus-visible:ring-ring has-focus-visible:ring-offset-2 has-checked:border-dark-yellow has-checked:bg-primary/25 has-disabled:cursor-not-allowed has-disabled:opacity-50',
        className,
      )}
    >
      <input
        type='radio'
        className='sr-only'
        name={choice.name}
        value={value}
        disabled={isDisabled}
        checked={isControlled ? choice.value === value : undefined}
        defaultChecked={
          isControlled ? undefined : choice.defaultValue === value
        }
        onChange={() => choice.onValueChange?.(value)}
      />
      <span
        aria-hidden
        className='relative mt-1 size-4 shrink-0 rounded-full border border-border'
      >
        {/* Forced colours replace backgrounds, so the dot uses the text colour */}
        <span className='absolute top-1/2 left-1/2 hidden size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-light-text group-has-checked/choice-card:block forced-colors:bg-[CanvasText] forced-colors:forced-color-adjust-none' />
      </span>
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
