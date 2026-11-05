'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { createContext, type ReactNode, useContext, useId } from 'react';
import { buttonVariants } from '~/components/ui/button';
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

type ButtonGroupChoiceContextValue = {
  name: string;
  value: string;
  onValueChange: (value: string) => void;
};

const ButtonGroupChoiceContext =
  createContext<ButtonGroupChoiceContextValue | null>(null);

type ButtonGroupChoiceProps = {
  className?: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  isDisabled?: boolean;
  children: ReactNode;
};

/** One choice from the group's buttons, which are native radio inputs. */
function ButtonGroupChoice({
  className,
  label,
  value,
  onValueChange,
  isDisabled = false,
  children,
}: ButtonGroupChoiceProps) {
  const name = useId();

  return (
    <ButtonGroupChoiceContext value={{ name, value, onValueChange }}>
      <fieldset disabled={isDisabled} className={cn('min-w-0', className)}>
        <legend className='sr-only'>{label}</legend>
        <div
          data-slot='button-group'
          data-orientation='horizontal'
          className={cn(
            buttonGroupVariants({ orientation: 'horizontal' }),
            'w-full',
          )}
        >
          {children}
        </div>
      </fieldset>
    </ButtonGroupChoiceContext>
  );
}

type ButtonGroupChoiceItemProps = {
  className?: string;
  value: string;
  children: ReactNode;
};

/** A radio in a {@link ButtonGroupChoice}, styled as one of its buttons. */
function ButtonGroupChoiceItem({
  className,
  value,
  children,
}: ButtonGroupChoiceItemProps) {
  const choice = useContext(ButtonGroupChoiceContext);
  if (!choice) {
    throw new Error('ButtonGroupChoiceItem must be inside a ButtonGroupChoice');
  }

  return (
    <label
      className={cn(
        buttonVariants({ variant: 'secondary', size: 'sm' }),
        'relative',
        'has-checked:bg-primary has-checked:font-extrabold',
        // Thickens the chosen button's edge, so it doesn't rely on colour.
        // An outline still shows in forced colours, where a ring wouldn't
        'has-checked:outline-2 has-checked:-outline-offset-4 has-checked:outline-light-text',
        'has-focus-visible:ring-4 has-focus-visible:ring-ring has-focus-visible:ring-offset-2',
        'has-disabled:pointer-events-none has-disabled:border-light-text-disabled has-disabled:bg-secondary-disabled has-disabled:text-light-text-disabled has-disabled:outline-light-text-disabled has-checked:has-disabled:bg-primary-disabled',
        className,
      )}
    >
      <input
        type='radio'
        className='sr-only'
        name={choice.name}
        value={value}
        checked={choice.value === value}
        onChange={() => choice.onValueChange(value)}
      />
      {children}
    </label>
  );
}

export {
  ButtonGroup,
  ButtonGroupChoice,
  ButtonGroupChoiceItem,
  ButtonGroupSeparator,
  buttonGroupVariants,
};
