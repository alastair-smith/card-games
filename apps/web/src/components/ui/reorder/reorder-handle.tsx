'use client';

import { GripVerticalIcon } from 'lucide-react';
import { cn } from '~/utils/cn';
import { useReorder, useReorderItem } from './reorder-context';

/**
 * The grip that picks up a row: drag it with a pointer, or focus it and press
 * space to pick the row up and the arrow keys to move it.
 */
export function ReorderHandle({
  className,
  children,
  ...props
}: React.ComponentProps<'button'>) {
  const { isDisabled } = useReorder();
  const { attributes, listeners, setActivatorNodeRef, label } =
    useReorderItem();

  return (
    <button
      type='button'
      ref={setActivatorNodeRef}
      aria-label={`Reorder ${label}`}
      disabled={isDisabled}
      data-slot='reorder-handle'
      className={cn(
        // touch-none stops a touch drag being swallowed by page scrolling.
        'flex size-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-light-text',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring',
        'active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...attributes}
      {...listeners}
      {...props}
    >
      {children ?? <GripVerticalIcon className='size-4' aria-hidden='true' />}
    </button>
  );
}
