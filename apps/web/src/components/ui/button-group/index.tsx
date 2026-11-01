'use client';

import { Radio as RadioPrimitive } from '@base-ui/react/radio';
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ReactNode } from 'react';
import { Button } from '~/components/ui/button';
import { Separator } from '~/components/ui/separator';
import { cn } from '~/utils/cn';

const buttonGroupVariants = cva(
  "flex w-fit items-stretch *:focus-visible:z-10 *:focus-visible:relative [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-md has-[>[data-slot=button-group]]:gap-2",
  {
    variants: {
      orientation: {
        horizontal:
          '[&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none',
        vertical:
          'flex-col [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0 [&>*:not(:last-child)]:rounded-b-none',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
    },
  },
);

function ButtonGroup({
  className,
  orientation,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof buttonGroupVariants>) {
  return (
    <div
      data-slot='button-group'
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
    />
  );
}

function ButtonGroupSeparator({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot='button-group-separator'
      orientation={orientation}
      className={cn(
        'bg-input relative m-0! self-stretch data-[orientation=vertical]:h-auto',
        className,
      )}
      {...props}
    />
  );
}

type ButtonGroupChoiceProps = {
  className?: string;
  /** Accessible name for the group, e.g. "Hand size". */
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  isDisabled?: boolean;
  children: ReactNode;
};

/**
 * One choice from the group's buttons, as a radio group: a single tab stop,
 * with the arrow keys moving the choice.
 */
function ButtonGroupChoice({
  className,
  label,
  value,
  onValueChange,
  isDisabled = false,
  children,
}: ButtonGroupChoiceProps) {
  return (
    <RadioGroupPrimitive
      data-slot='button-group'
      data-orientation='horizontal'
      aria-label={label}
      value={value}
      disabled={isDisabled}
      onValueChange={(newValue: string) => onValueChange(newValue)}
      className={cn(
        buttonGroupVariants({ orientation: 'horizontal' }),
        // Each radio is followed by a hidden input, so the last button isn't
        // the last child
        '[&>button:last-of-type]:rounded-r-md',
        className,
      )}
    >
      {children}
    </RadioGroupPrimitive>
  );
}

type ButtonGroupChoiceItemProps = {
  className?: string;
  value: string;
  children: ReactNode;
};

/** A button in a {@link ButtonGroupChoice}, standing out when it's chosen. */
function ButtonGroupChoiceItem({
  className,
  value,
  children,
}: ButtonGroupChoiceItemProps) {
  return (
    <RadioPrimitive.Root
      value={value}
      nativeButton
      render={(props, state) => (
        <Button
          {...props}
          size='sm'
          variant={state.checked ? 'default' : 'secondary'}
          className={cn(props.className, className)}
        />
      )}
    >
      {children}
    </RadioPrimitive.Root>
  );
}

export {
  ButtonGroup,
  ButtonGroupChoice,
  ButtonGroupChoiceItem,
  ButtonGroupSeparator,
  buttonGroupVariants,
};
