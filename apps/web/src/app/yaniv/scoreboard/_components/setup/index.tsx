import { CrossIcon, Trash2Icon, TrashIcon, XIcon } from 'lucide-react';
import type { ChangeEvent } from 'react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Reorder, ReorderHandle, ReorderItem } from '~/components/ui/reorder';
import {
  MAX_NAME_LENGTH,
  type PlayerName,
  type UserId,
} from '~/types/entities';

export type SetupProps = {
  players: {
    id: UserId;
    name: PlayerName;
  }[];
  updatePlayerName: (playerId: UserId, newName: PlayerName) => void;
  reorderPlayers: (newPlayerIds: string[]) => void;
  removePlayer: (playerId: UserId) => void;
};

export default function Setup({
  players,
  updatePlayerName,
  reorderPlayers,
  removePlayer,
}: SetupProps) {
  const nameChangeHandler =
    (id: UserId) => (event: ChangeEvent<HTMLInputElement>) => {
      updatePlayerName(id, event.target.value as PlayerName);
    };

  return (
    <div>
      <h2>Enter Player Names</h2>

      <Reorder
        itemIds={players.map(({ id }) => id)}
        label='Player order'
        onReorder={reorderPlayers}
      >
        {players.map((player) => (
          <ReorderItem key={player.id} id={player.id} label={player.name}>
            <ReorderHandle />
            <Input
              value={player.name}
              maxLength={MAX_NAME_LENGTH}
              onChange={nameChangeHandler(player.id)}
            />
            <Button
              variant='danger'
              size='icon'
              onClick={() => removePlayer(player.id)}
            >
              <Trash2Icon />
            </Button>
          </ReorderItem>
        ))}
      </Reorder>
    </div>
  );
}
