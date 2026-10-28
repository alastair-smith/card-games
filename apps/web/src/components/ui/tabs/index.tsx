'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import type * as React from 'react';
import { cn } from '~/utils/cn';
import {
  type PlayerColor,
  playerColorHighlight,
  playerColorValue,
} from '~/utils/player-color';

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot='tabs'
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot='tabs-list'
      className={cn(
        'bg-alt-background inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]',
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  style,
  children,
  actionColor,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> & {
  /**
   * Marks the tab as holding the player's next move: it pulses in this
   * colour, with a dot beside its label.
   */
  actionColor?: PlayerColor | undefined;
}) {
  return (
    <TabsPrimitive.Trigger
      data-slot='tabs-trigger'
      style={
        actionColor
          ? ({
              '--color-highlight': playerColorHighlight(actionColor),
              ...style,
            } as React.CSSProperties)
          : style
      }
      className={cn(
        "data-[state=active]:bg-card-background focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring text-dark-text data-[state=active]:text-light-text inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        actionColor && 'motion-safe:animate-pulse-bg',
        className,
      )}
      {...props}
    >
      {children}
      {actionColor && (
        <>
          <span
            aria-hidden='true'
            style={{ backgroundColor: playerColorValue(actionColor) }}
            className='size-2.5 rounded-full border border-white'
          />
          <span className='sr-only'>, your move</span>
        </>
      )}
    </TabsPrimitive.Trigger>
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot='tabs-content'
      className={cn('flex-1 outline-none', className)}
      {...props}
    />
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
