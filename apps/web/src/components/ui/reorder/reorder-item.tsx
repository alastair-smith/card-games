'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEffect, useMemo } from 'react';
import { cn } from '~/utils/cn';
import { ReorderItemContext, useReorder } from './reorder-context';

type ReorderItemProps = {
  /** Stable id for this item, matching one of the list's `items`. */
  id: string;
  /** Human-readable name, used to label the handle and in announcements. */
  label: string;
  className?: string;
  children: React.ReactNode;
};

/**
 * A single row of a `Reorder` list. Renders a `ReorderHandle` somewhere inside
 * to give the row a grip that starts a drag.
 */
export function ReorderItem({
  id,
  label,
  className,
  children,
}: ReorderItemProps) {
  const { isDisabled, onLabelRegister } = useReorder();
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: isDisabled });

  useEffect(() => {
    onLabelRegister(id, label);
  }, [id, label, onLabelRegister]);

  const context = useMemo(
    () => ({
      attributes,
      listeners,
      setActivatorNodeRef,
      label,
      isDragging,
    }),
    [attributes, listeners, setActivatorNodeRef, label, isDragging],
  );

  return (
    <li
      ref={setNodeRef}
      data-slot='reorder-item'
      data-dragging={isDragging || undefined}
      style={{
        // Translate rather than Transform so the row slides without picking up
        // the scale of whatever it is swapping places with.
        transform: CSS.Translate.toString(transform),
        transition,
      }}
      className={cn(
        'flex items-center gap-2 rounded-md border-2 border-border bg-card-background p-2',
        isDragging && 'relative z-10 shadow-lg',
        className,
      )}
    >
      <ReorderItemContext.Provider value={context}>
        {children}
      </ReorderItemContext.Provider>
    </li>
  );
}
