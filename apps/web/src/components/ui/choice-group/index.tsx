'use client';

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useId,
  useState,
} from 'react';
import { Label } from '~/components/ui/label';
import { cn } from '~/utils/cn';

type ChoiceGroupContextValue = {
  name: string;
  value: string | undefined;
  defaultValue: string | undefined;
  onValueChange: ((value: string) => void) | undefined;
  descriptionId: string;
  setHasDescription: (hasDescription: boolean) => void;
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
 * Choose an option via cards, which are native radio inputs. A
 * `ChoiceGroupDescription` inside it describes the group.
 *
 * Keep buttons, links and other controls out of a `ChoiceCard`. Each card is
 * its radio's `<label>`, and HTML allows no other form control inside a label.
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
  const descriptionId = `${name}-description`;
  const [hasDescription, setHasDescription] = useState(false);

  return (
    <ChoiceGroupContext
      value={{
        name,
        value,
        defaultValue,
        onValueChange,
        descriptionId,
        setHasDescription,
      }}
    >
      <fieldset
        data-slot='choice-group'
        disabled={isDisabled}
        aria-describedby={hasDescription ? descriptionId : undefined}
        className={cn('grid w-full min-w-0 gap-3', className)}
      >
        <legend className='sr-only'>{label}</legend>
        {children}
      </fieldset>
    </ChoiceGroupContext>
  );
}

export function ChoiceGroupDescription({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const choice = useContext(ChoiceGroupContext);
  if (!choice) {
    throw new Error('ChoiceGroupDescription must be inside a ChoiceGroup');
  }
  const { descriptionId, setHasDescription } = choice;

  useEffect(() => {
    setHasDescription(true);
    return () => setHasDescription(false);
  }, [setHasDescription]);

  return (
    <p
      id={descriptionId}
      data-slot='choice-group-description'
      className={cn('col-span-full', className)}
    >
      {children}
    </p>
  );
}

type ChoiceCardContextValue = {
  titleId: string;
  descriptionId: string;
  setHasTitle: (hasTitle: boolean) => void;
  setHasDescription: (hasDescription: boolean) => void;
};

const ChoiceCardContext = createContext<ChoiceCardContextValue | null>(null);

type ChoiceCardProps = {
  /** The value this card selects within its group. */
  value: string;
  /** Turns off selection for this card only. */
  isDisabled?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * Clickable choice within a {@link ChoiceGroup}. Its radio is named by its
 * `ChoiceCardTitle` and described by its `ChoiceCardDescription`, or named by
 * all of its text when it has no title.
 *
 * Keep buttons, links and other controls out of a card. The card is the
 * radio's `<label>`, and HTML allows no other form control inside a label.
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

  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;
  const [hasTitle, setHasTitle] = useState(false);
  const [hasDescription, setHasDescription] = useState(false);

  const isControlled = choice.value !== undefined;

  return (
    <ChoiceCardContext
      value={{ titleId, descriptionId, setHasTitle, setHasDescription }}
    >
      <Label
        data-slot='choice-card'
        className={cn(
          'group/choice-card flex cursor-pointer items-start gap-3 rounded-lg border-2 border-border bg-input-background p-4 text-base leading-normal text-light-text has-focus-visible:ring-4 has-focus-visible:ring-ring has-focus-visible:ring-offset-2 has-checked:border-dark-yellow has-checked:bg-[color-mix(in_srgb,var(--color-primary)_25%,var(--color-card-background))] has-disabled:cursor-not-allowed has-disabled:opacity-50',
          className,
        )}
      >
        <input
          type='radio'
          className='sr-only'
          name={choice.name}
          value={value}
          disabled={isDisabled}
          aria-labelledby={hasTitle ? titleId : undefined}
          aria-describedby={hasDescription ? descriptionId : undefined}
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
    </ChoiceCardContext>
  );
}

const useChoiceCard = (componentName: string) => {
  const card = useContext(ChoiceCardContext);
  if (!card) {
    throw new Error(`${componentName} must be inside a ChoiceCard`);
  }
  return card;
};

type ChoiceCardTextProps = {
  className?: string;
  children: ReactNode;
};

export function ChoiceCardTitle({ className, children }: ChoiceCardTextProps) {
  const { titleId, setHasTitle } = useChoiceCard('ChoiceCardTitle');

  useEffect(() => {
    setHasTitle(true);
    return () => setHasTitle(false);
  }, [setHasTitle]);

  return (
    <span
      id={titleId}
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
  const { descriptionId, setHasDescription } = useChoiceCard(
    'ChoiceCardDescription',
  );

  useEffect(() => {
    setHasDescription(true);
    return () => setHasDescription(false);
  }, [setHasDescription]);

  return (
    <span
      id={descriptionId}
      data-slot='choice-card-description'
      className={cn('text-sm text-light-text-disabled', className)}
    >
      {children}
    </span>
  );
}
