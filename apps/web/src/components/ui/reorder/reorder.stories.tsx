import { action } from '@ladle/react';
import { useState } from 'react';
import { Input } from '~/components/ui/input';
import { Reorder, ReorderHandle, ReorderItem } from '.';

export default {
  title: 'Components / Reorder',
};

const onReorder = action('onReorder');

const initialPlayers = [
  { id: 'player-1', name: 'Alice' },
  { id: 'player-2', name: 'Bob' },
  { id: 'player-3', name: 'Carol' },
  { id: 'player-4', name: 'Dan' },
];

function usePlayerOrder() {
  const [players, setPlayers] = useState(initialPlayers);

  const handleReorder = (items: string[]) => {
    setPlayers((current) =>
      items.flatMap((id) => current.filter((player) => player.id === id)),
    );
    onReorder(items);
  };

  return { players, handleReorder };
}

// Drag a row by its grip, or focus a grip and press space to pick the row up,
// then the arrow keys to move it and space again to drop it.
export const Default = () => {
  const { players, handleReorder } = usePlayerOrder();

  return (
    <div className='w-80 p-4'>
      <Reorder
        items={players.map((player) => player.id)}
        label='Player turn order'
        onReorder={handleReorder}
      >
        {players.map((player) => (
          <ReorderItem key={player.id} id={player.id} label={player.name}>
            <ReorderHandle />
            <span className='text-light-text'>{player.name}</span>
          </ReorderItem>
        ))}
      </Reorder>
    </div>
  );
};

// The case this was built for: name fields that set the turn order. The grip
// keeps dragging separate from typing, so the inputs stay usable.
export const WithNameInputs = () => {
  const { players, handleReorder } = usePlayerOrder();

  return (
    <div className='w-80 p-4'>
      <Reorder
        items={players.map((player) => player.id)}
        label='Player turn order'
        onReorder={handleReorder}
      >
        {players.map((player, index) => (
          <ReorderItem key={player.id} id={player.id} label={player.name}>
            <ReorderHandle />
            <span className='w-5 text-center text-light-text tabular-nums'>
              {index + 1}
            </span>
            <Input
              defaultValue={player.name}
              aria-label={`Player ${index + 1} name`}
            />
          </ReorderItem>
        ))}
      </Reorder>
    </div>
  );
};

// Reordering can be turned off once a game is under way, without the rows
// losing their content.
export const Disabled = () => {
  const { players, handleReorder } = usePlayerOrder();

  return (
    <div className='w-80 p-4'>
      <Reorder
        items={players.map((player) => player.id)}
        label='Player turn order'
        isDisabled
        onReorder={handleReorder}
      >
        {players.map((player) => (
          <ReorderItem key={player.id} id={player.id} label={player.name}>
            <ReorderHandle />
            <span className='text-light-text'>{player.name}</span>
          </ReorderItem>
        ))}
      </Reorder>
    </div>
  );
};
