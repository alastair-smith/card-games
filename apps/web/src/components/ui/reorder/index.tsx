'use client';

import {
  type Announcements,
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  type ScreenReaderInstructions,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useCallback, useMemo, useRef } from 'react';
import { cn } from '~/utils/cn';
import { ReorderContext } from './reorder-context';

export { ReorderHandle } from './reorder-handle';
export { ReorderItem } from './reorder-item';

const screenReaderInstructions: ScreenReaderInstructions = {
  draggable:
    'To reorder this list, press space or enter to pick up an item, then use the up and down arrow keys to move it. Press space or enter again to drop it into its new position, or press escape to cancel.',
};

type ReorderProps = {
  itemIds: string[];
  /** Accessible name for the list, e.g. "Player turn order". */
  label: string;
  onReorder: (newItemIds: string[]) => void;
  /** Turns off reordering for entire list. */
  isDisabled?: boolean;
  className?: string;
  children: React.ReactNode;
};

/** A vertical list whose items can be reordered via a handler. */
export function Reorder({
  itemIds,
  label,
  onReorder,
  isDisabled = false,
  className,
  children,
}: ReorderProps) {
  const labels = useRef(new Map<string, string>());
  const hasMoved = useRef(false);

  const sensors = useSensors(
    // A small distance threshold prevents a clicks on row content from being mistaken for the start of a drag.
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const onLabelRegister = useCallback((id: string, itemLabel: string) => {
    labels.current.set(id, itemLabel);
  }, []);

  const context = useMemo(
    () => ({ isDisabled, onLabelRegister }),
    [isDisabled, onLabelRegister],
  );

  const getLabel = (id: UniqueIdentifier) =>
    labels.current.get(String(id)) ?? String(id);
  const getPosition = (id: UniqueIdentifier) => itemIds.indexOf(String(id)) + 1;

  // For more readable accessibility announcements than the library's defaults.
  const announcements: Announcements = {
    onDragStart: ({ active }) => {
      hasMoved.current = false;
      return `Picked up ${getLabel(active.id)}, position ${getPosition(active.id)} of ${itemIds.length}.`;
    },
    onDragOver: ({ active, over }) => {
      if (!over) {
        return undefined;
      }

      // Keep quiet until moved.
      if (over.id === active.id && !hasMoved.current) {
        return undefined;
      }

      hasMoved.current = true;
      return `${getLabel(active.id)} moved to position ${getPosition(over.id)} of ${itemIds.length}.`;
    },
    onDragEnd: ({ active, over }) =>
      over
        ? `${getLabel(active.id)} dropped into position ${getPosition(over.id)} of ${itemIds.length}.`
        : `${getLabel(active.id)} dropped.`,
    onDragCancel: ({ active }) =>
      `Reordering cancelled. ${getLabel(active.id)} is back in position ${getPosition(active.id)} of ${itemIds.length}.`,
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) {
      return;
    }

    const fromIndex = itemIds.indexOf(String(active.id));
    const toIndex = itemIds.indexOf(String(over.id));

    if (fromIndex === -1 || toIndex === -1) {
      return;
    }

    onReorder(arrayMove(itemIds, fromIndex, toIndex));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      accessibility={{ announcements, screenReaderInstructions }}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={itemIds}
        strategy={verticalListSortingStrategy}
        disabled={isDisabled}
      >
        <ol
          data-slot='reorder'
          aria-label={label}
          className={cn('flex list-none flex-col gap-2 p-0', className)}
        >
          <ReorderContext.Provider value={context}>
            {children}
          </ReorderContext.Provider>
        </ol>
      </SortableContext>
    </DndContext>
  );
}
