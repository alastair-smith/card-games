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
  /**
   * Item ids in their current order. Every id must match the id of a
   * `ReorderItem` rendered as a child.
   */
  items: string[];
  /** Accessible name for the list, e.g. "Player turn order". */
  label: string;
  /** Called with the full list of ids in their new order. */
  onReorder: (items: string[]) => void;
  /** Turns off dragging and keyboard reordering for every item. */
  isDisabled?: boolean;
  className?: string;
  children: React.ReactNode;
};

/**
 * A vertical list whose items can be reordered by dragging a handle, or by
 * focusing a handle and pressing space to pick the item up and the arrow keys
 * to move it.
 */
export function Reorder({
  items,
  label,
  onReorder,
  isDisabled = false,
  className,
  children,
}: ReorderProps) {
  const labels = useRef(new Map<string, string>());
  const hasMoved = useRef(false);

  const sensors = useSensors(
    // A small distance threshold means a plain click on anything inside a row
    // (a name input, say) is not mistaken for the start of a drag.
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
  const getPosition = (id: UniqueIdentifier) => items.indexOf(String(id)) + 1;

  // The defaults announce raw item ids, which read out as gibberish when the
  // ids are uuids. These say the player's name and where they ended up.
  const announcements: Announcements = {
    onDragStart: ({ active }) => {
      hasMoved.current = false;
      return `Picked up ${getLabel(active.id)}, position ${getPosition(active.id)} of ${items.length}.`;
    },
    onDragOver: ({ active, over }) => {
      if (!over) {
        return undefined;
      }

      // Picking an item up immediately reports it as over itself. Staying quiet
      // until it has actually moved keeps that from talking over the pick-up
      // announcement, but once it has moved, a return to the start is worth
      // announcing.
      if (over.id === active.id && !hasMoved.current) {
        return undefined;
      }

      hasMoved.current = true;
      return `${getLabel(active.id)} moved to position ${getPosition(over.id)} of ${items.length}.`;
    },
    onDragEnd: ({ active, over }) =>
      over
        ? `${getLabel(active.id)} dropped into position ${getPosition(over.id)} of ${items.length}.`
        : `${getLabel(active.id)} dropped.`,
    onDragCancel: ({ active }) =>
      `Reordering cancelled. ${getLabel(active.id)} is back in position ${getPosition(active.id)} of ${items.length}.`,
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) {
      return;
    }

    const fromIndex = items.indexOf(String(active.id));
    const toIndex = items.indexOf(String(over.id));

    if (fromIndex === -1 || toIndex === -1) {
      return;
    }

    onReorder(arrayMove(items, fromIndex, toIndex));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      // Keep the dragged row travelling up and down its own list, rather than
      // being flung sideways or out of the container.
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      accessibility={{ announcements, screenReaderInstructions }}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items}
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
