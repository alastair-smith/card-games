import type { useSortable } from '@dnd-kit/sortable';
import { createContext, useContext } from 'react';

type SortableResult = ReturnType<typeof useSortable>;

export type ReorderContextValue = {
  /** Whether reordering is turned off for the whole list. */
  isDisabled: boolean;
  /** Records an item's human-readable name so the list can use it in screen reader announcements. */
  onLabelRegister: (id: string, label: string) => void;
};

export const ReorderContext = createContext<ReorderContextValue | null>(null);

export function useReorder() {
  const context = useContext(ReorderContext);

  if (!context) {
    throw new Error('Reorder components must be rendered inside <Reorder>');
  }

  return context;
}

export type ReorderItemContextValue = {
  attributes: SortableResult['attributes'];
  listeners: SortableResult['listeners'];
  setActivatorNodeRef: SortableResult['setActivatorNodeRef'];
  /** Human-readable name for the item, used to label its handle. */
  label: string;
  isDragging: boolean;
};

export const ReorderItemContext = createContext<ReorderItemContextValue | null>(
  null,
);

export function useReorderItem() {
  const context = useContext(ReorderItemContext);

  if (!context) {
    throw new Error('ReorderHandle must be rendered inside <ReorderItem>');
  }

  return context;
}
