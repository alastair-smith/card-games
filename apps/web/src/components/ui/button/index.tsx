import { Root as SlotRoot, Slottable } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { LoaderIcon } from 'lucide-react';
import * as React from 'react';
import { cn } from '~/utils/cn';

const buttonVariants = cva(
  'flex gap-2 items-center justify-center cursor-pointer overflow-hidden border-2 font-semibold active:scale-95 whitespace-nowrap text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-light-text disabled:bg-primary-disabled disabled:text-light-text-disabled disabled:border-light-text-disabled',
        secondary:
          'bg-secondary text-light-text disabled:bg-secondary-disabled disabled:text-light-text-disabled disabled:border-light-text-disabled',
        danger:
          'bg-danger text-dark-text disabled:bg-danger-disabled disabled:text-light-text-disabled border-border disabled:border-light-text-disabled',
      },
      size: {
        default: 'h-10 rounded-lg px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading,
      disabled,
      asChild = false,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? SlotRoot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading && <LoaderIcon className='relative animate-spin' />}
        <Slottable>{children}</Slottable>
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
