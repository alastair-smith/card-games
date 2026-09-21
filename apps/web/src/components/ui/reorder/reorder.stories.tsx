import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { Input } from '~/components/ui/input';
import { Reorder, ReorderHandle, ReorderItem } from '.';

const initialPlayers = [
  { id: 'player-1', name: 'Alice' },
  { id: 'player-2', name: 'Bob' },
  { id: 'player-3', name: 'Carol' },
  { id: 'player-4', name: 'Dan' },
];

type ReorderStoryProps = ComponentProps<typeof Reorder> & {
  areInputsShown: boolean;
};

const meta: Meta<ReorderStoryProps> = {
  title: 'UI Components /Reorder',
  component: Reorder,
  args: {
    label: 'Player turn order',
    isDisabled: false,
    areInputsShown: false,
    onReorder: fn(),
  },
  render: ({ areInputsShown, onReorder, itemIds: _itemIds, ...args }) => {
    const [players, setPlayers] = useState(initialPlayers);

    const handleReorder = (itemIds: string[]) => {
      setPlayers((current) =>
        itemIds.flatMap((id) => current.filter((player) => player.id === id)),
      );
      onReorder?.(itemIds);
    };

    return (
      <div className='w-80 p-4'>
        <Reorder
          {...args}
          itemIds={players.map((player) => player.id)}
          onReorder={handleReorder}
        >
          {players.map((player, index) => (
            <ReorderItem key={player.id} id={player.id} label={player.name}>
              <ReorderHandle />
              {areInputsShown ? (
                <>
                  <span className='w-5 text-center text-light-text tabular-nums'>
                    {index + 1}
                  </span>
                  <Input
                    defaultValue={player.name}
                    aria-label={`Player ${index + 1} name`}
                  />
                </>
              ) : (
                <span className='text-light-text'>{player.name}</span>
              )}
            </ReorderItem>
          ))}
        </Reorder>
      </div>
    );
  },
};

export default meta;

type Story = StoryObj<ReorderStoryProps>;

export const Default: Story = {};

export const WithInputsInChildren: Story = {
  args: { areInputsShown: true },
};

export const Disabled: Story = { args: { isDisabled: true } };
