import * as React from "react";
import { Root as SlotRoot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils/cn";

// TODO fix colors and then fix loading bar state
const buttonVariants = cva(
  "relative overflow-hidden border-2 shadow-md shadow-border font-semibold active:shadow-none active:scale-95 inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary-background text-primary hover:bg-primary-background/90 disabled:bg-primary-disabled",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:bg-secondary-disabled",
      },
      size: {
        default: "h-10 rounded-xl px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
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
  ({ className, variant, size, isLoading, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? SlotRoot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        <span
          className={cn(
            "absolute inset-y-0 left-0 bg-primary-background transition-all duration-500",
            isLoading ? "w-full" : "w-0",
          )}
        />
        <Slottable>
          <span className="relative">{children}</span>
        </Slottable>
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
