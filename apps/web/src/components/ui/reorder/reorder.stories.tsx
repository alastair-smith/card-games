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

  const handleReorder = (itemIds: string[]) => {
    setPlayers((current) =>
      itemIds.flatMap((id) => current.filter((player) => player.id === id)),
    );
    onReorder(itemIds);
  };

  return { players, handleReorder };
}

export const Default = () => {
  const { players, handleReorder } = usePlayerOrder();

  return (
    <div className='w-80 p-4'>
      <Reorder
        itemIds={players.map((player) => player.id)}
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

export const WithInputsInChildren = () => {
  const { players, handleReorder } = usePlayerOrder();

  return (
    <div className='w-80 p-4'>
      <Reorder
        itemIds={players.map((player) => player.id)}
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

export const Disabled = () => {
  const { players, handleReorder } = usePlayerOrder();

  return (
    <div className='w-80 p-4'>
      <Reorder
        itemIds={players.map((player) => player.id)}
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
