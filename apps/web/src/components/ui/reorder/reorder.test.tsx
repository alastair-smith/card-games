import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { beforeAll, describe, expect, test, vi } from 'vitest';
import { Input } from '~/components/ui/input';
import { Reorder, ReorderHandle, ReorderItem } from '.';

const ROW_HEIGHT = 48;

beforeAll(() => {
  // dnd-kit works out where a picked-up row can go by measuring the rows, and
  // jsdom reports every element as a zero-sized box at the origin. Give each
  // row a height and a position so the keyboard sensor has real geometry.
  Element.prototype.getBoundingClientRect = function (this: Element) {
    const row = this.closest('[data-slot="reorder-item"]');
    const list = row?.parentElement;

    if (row && list) {
      const index = Array.from(list.children).indexOf(row);
      return new DOMRect(0, index * ROW_HEIGHT, 300, ROW_HEIGHT);
    }

    return new DOMRect(0, 0, 300, ROW_HEIGHT * 4);
  };

  Element.prototype.scrollIntoView = () => {};
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const players = [
  { id: 'player-1', name: 'Alice' },
  { id: 'player-2', name: 'Bob' },
  { id: 'player-3', name: 'Carol' },
];

const noop = () => {};

function PlayerOrder({
  onReorder = noop,
  isDisabled = false,
}: {
  onReorder?: (itemIds: string[]) => void;
  isDisabled?: boolean;
}) {
  const [order, setOrder] = useState(players.map((player) => player.id));

  return (
    <Reorder
      itemIds={order}
      label='Player turn order'
      isDisabled={isDisabled}
      onReorder={(itemIds) => {
        setOrder(itemIds);
        onReorder(itemIds);
      }}
    >
      {order.map((id) => {
        const player = players.find((candidate) => candidate.id === id);

        if (!player) {
          return null;
        }

        return (
          <ReorderItem key={player.id} id={player.id} label={player.name}>
            <ReorderHandle />
            <Input
              defaultValue={player.name}
              aria-label={`${player.name} name`}
            />
          </ReorderItem>
        );
      })}
    </Reorder>
  );
}

/** The player names in the order their rows currently appear in the list. */
function getPlayerOrder() {
  return screen
    .getAllByRole('button')
    .map((handle) =>
      handle.getAttribute('aria-label')?.replace('Reorder ', ''),
    );
}

/**
 * dnd-kit measures the rows a frame after one is picked up, so without waiting
 * for that frame the arrow keys have no geometry to move the row against.
 */
async function settle() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
}

/** Picks up a row with the keyboard, ready for the arrow keys to move it. */
async function pickUp(name: string) {
  const handle = screen.getByRole('button', { name: `Reorder ${name}` });
  fireEvent.keyDown(handle, { code: 'Space' });
  await settle();
  return handle;
}

/** Moves a picked-up row one place in the given direction. */
async function pressArrow(handle: HTMLElement, code: 'ArrowUp' | 'ArrowDown') {
  fireEvent.keyDown(handle, { code });
  await settle();
}

describe('Reorder', () => {
  describe('list structure', () => {
    test('names the list for assistive technology', () => {
      render(<PlayerOrder />);
      expect(
        screen.getByRole('list', { name: 'Player turn order' }),
      ).toBeInTheDocument();
    });

    test('renders a row for every item', () => {
      render(<PlayerOrder />);
      expect(screen.getAllByRole('listitem')).toHaveLength(3);
    });

    test('gives every row a handle named after the item', () => {
      render(<PlayerOrder />);
      expect(
        screen.getByRole('button', { name: 'Reorder Alice' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Reorder Bob' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Reorder Carol' }),
      ).toBeInTheDocument();
    });

    test('explains how to reorder the list when a handle is focused', () => {
      render(<PlayerOrder />);
      const handle = screen.getByRole('button', { name: 'Reorder Alice' });
      const instructions = document.getElementById(
        handle.getAttribute('aria-describedby') ?? '',
      );
      expect(instructions).toHaveTextContent(
        /press space or enter to pick up an item/i,
      );
      expect(instructions).toHaveTextContent(/up and down arrow keys/i);
    });
  });

  describe('keyboard reordering', () => {
    test('moves an item later in the order when it is dropped a place down', async () => {
      const onReorder = vi.fn();
      render(<PlayerOrder onReorder={onReorder} />);

      const handle = await pickUp('Alice');
      await pressArrow(handle, 'ArrowDown');
      fireEvent.keyDown(handle, { code: 'Space' });

      expect(onReorder).toHaveBeenCalledWith([
        'player-2',
        'player-1',
        'player-3',
      ]);
      expect(getPlayerOrder()).toEqual(['Bob', 'Alice', 'Carol']);
    });

    test('moves an item earlier in the order when it is dropped a place up', async () => {
      const onReorder = vi.fn();
      render(<PlayerOrder onReorder={onReorder} />);

      const handle = await pickUp('Carol');
      await pressArrow(handle, 'ArrowUp');
      fireEvent.keyDown(handle, { code: 'Space' });

      expect(onReorder).toHaveBeenCalledWith([
        'player-1',
        'player-3',
        'player-2',
      ]);
      expect(getPlayerOrder()).toEqual(['Alice', 'Carol', 'Bob']);
    });

    test('moves an item more than one place when the arrow is pressed again', async () => {
      const onReorder = vi.fn();
      render(<PlayerOrder onReorder={onReorder} />);

      const handle = await pickUp('Alice');
      await pressArrow(handle, 'ArrowDown');
      await pressArrow(handle, 'ArrowDown');
      fireEvent.keyDown(handle, { code: 'Space' });

      expect(onReorder).toHaveBeenCalledWith([
        'player-2',
        'player-3',
        'player-1',
      ]);
    });

    test('keeps the item at the end of the list when it cannot move down', async () => {
      const onReorder = vi.fn();
      render(<PlayerOrder onReorder={onReorder} />);

      const handle = await pickUp('Carol');
      await pressArrow(handle, 'ArrowDown');
      fireEvent.keyDown(handle, { code: 'Space' });

      expect(onReorder).not.toHaveBeenCalled();
    });

    test('leaves the order alone when reordering is cancelled', async () => {
      const onReorder = vi.fn();
      render(<PlayerOrder onReorder={onReorder} />);

      const handle = await pickUp('Alice');
      await pressArrow(handle, 'ArrowDown');
      fireEvent.keyDown(handle, { code: 'Escape' });

      expect(onReorder).not.toHaveBeenCalled();
    });

    test('leaves the order alone when an item is dropped where it started', async () => {
      const onReorder = vi.fn();
      render(<PlayerOrder onReorder={onReorder} />);

      const handle = await pickUp('Bob');
      fireEvent.keyDown(handle, { code: 'Space' });

      expect(onReorder).not.toHaveBeenCalled();
    });

    test('keeps focus on the handle of the item that moved', async () => {
      render(<PlayerOrder />);

      const handle = await pickUp('Alice');
      handle.focus();
      await pressArrow(handle, 'ArrowDown');
      fireEvent.keyDown(handle, { code: 'Space' });

      expect(getPlayerOrder()).toEqual(['Bob', 'Alice', 'Carol']);
      expect(
        screen.getByRole('button', { name: 'Reorder Alice' }),
      ).toHaveFocus();
    });
  });

  describe('announcements', () => {
    test('says which item was picked up and where it sits', async () => {
      render(<PlayerOrder />);

      await pickUp('Alice');

      expect(screen.getByRole('status')).toHaveTextContent(
        'Picked up Alice, position 1 of 3.',
      );
    });

    test('says the new position by name as an item moves', async () => {
      render(<PlayerOrder />);

      const handle = await pickUp('Alice');
      await pressArrow(handle, 'ArrowDown');

      expect(screen.getByRole('status')).toHaveTextContent(
        'Alice moved to position 2 of 3.',
      );
    });

    test('says where an item landed when it is dropped', async () => {
      render(<PlayerOrder />);

      const handle = await pickUp('Alice');
      await pressArrow(handle, 'ArrowDown');
      fireEvent.keyDown(handle, { code: 'Space' });

      expect(screen.getByRole('status')).toHaveTextContent(
        'Alice dropped into position 2 of 3.',
      );
    });

    test('says the item is back where it started when reordering is cancelled', async () => {
      render(<PlayerOrder />);

      const handle = await pickUp('Alice');
      await pressArrow(handle, 'ArrowDown');
      fireEvent.keyDown(handle, { code: 'Escape' });

      expect(screen.getByRole('status')).toHaveTextContent(
        'Reordering cancelled. Alice is back in position 1 of 3.',
      );
    });
  });

  describe('when reordering is turned off', () => {
    test('stops the handles being used', () => {
      render(<PlayerOrder isDisabled />);
      expect(
        screen.getByRole('button', { name: 'Reorder Alice' }),
      ).toBeDisabled();
    });

    test('ignores an attempt to move an item with the keyboard', async () => {
      const onReorder = vi.fn();
      render(<PlayerOrder isDisabled onReorder={onReorder} />);

      const handle = await pickUp('Alice');
      await pressArrow(handle, 'ArrowDown');
      fireEvent.keyDown(handle, { code: 'Space' });

      expect(onReorder).not.toHaveBeenCalled();
    });

    test('keeps the rows readable and editable', () => {
      render(<PlayerOrder isDisabled />);
      expect(screen.getByRole('textbox', { name: 'Alice name' })).toBeEnabled();
    });
  });
});
