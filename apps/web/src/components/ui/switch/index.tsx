'use client';

import { Root, Thumb } from '@radix-ui/react-switch';
import type { ComponentProps } from 'react';
import { cn } from '~/utils/cn';

export function Switch({ className, ...props }: ComponentProps<typeof Root>) {
  return (
    <Root
      data-slot='switch'
      className={cn(
        ' data-[state=checked]:bg-primary focus:ring-ring data-[state=unchecked]:bg-alt-background peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <Thumb
        data-slot='switch-thumb'
        className={cn(
          'bg-white border-2 border-transparent pointer-events-none block h-5 w-5 rounded-full shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
        )}
      />
    </Root>
  );
}
