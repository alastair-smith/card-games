import { Trash2Icon, UserPlusIcon } from 'lucide-react';
import type { ChangeEvent } from 'react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Reorder, ReorderHandle, ReorderItem } from '~/components/ui/reorder';
import {
  MAX_NAME_LENGTH,
  type PlayerName,
  type UserId,
} from '~/types/entities';
import FieldError from '../field-error';

export type SetupProps = {
  players: {
    id: UserId;
    name: PlayerName;
  }[];
  /** What each player still needs before the game can go on, if anything. */
  errors?: Partial<Record<UserId, string>>;
  updatePlayerName: (playerId: UserId, newName: PlayerName) => void;
  reorderPlayers: (newPlayerIds: string[]) => void;
  removePlayer: (playerId: UserId) => void;
  addPlayer: (name: PlayerName) => void;
};

export default function Setup({
  players,
  errors,
  updatePlayerName,
  reorderPlayers,
  removePlayer,
  addPlayer,
}: SetupProps) {
  const nameChangeHandler =
    (id: UserId) => (event: ChangeEvent<HTMLInputElement>) => {
      updatePlayerName(id, event.target.value as PlayerName);
    };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enter player names</CardTitle>
      </CardHeader>

      <CardContent className='flex flex-col gap-4'>
        <Reorder
          itemIds={players.map(({ id }) => id)}
          label='Player order'
          onReorder={reorderPlayers}
        >
          {players.map((player, index) => {
            const error = errors?.[player.id];
            const errorId = `player-${player.id}-error`;

            return (
              <ReorderItem
                key={player.id}
                id={player.id}
                label={player.name}
                className='bg-highlighted-card-background'
              >
                <div className='flex w-full flex-col gap-1'>
                  <div className='flex items-center gap-2'>
                    <ReorderHandle />
                    <Input
                      value={player.name}
                      maxLength={MAX_NAME_LENGTH}
                      aria-label={`Player ${index + 1} name`}
                      aria-invalid={error ? true : undefined}
                      aria-describedby={error ? errorId : undefined}
                      onChange={nameChangeHandler(player.id)}
                    />
                    <Button
                      variant='danger'
                      size='icon'
                      aria-label={`Remove ${player.name || 'this player'}`}
                      onClick={() => removePlayer(player.id)}
                    >
                      <Trash2Icon aria-hidden='true' />
                    </Button>
                  </div>

                  <FieldError id={errorId}>{error}</FieldError>
                </div>
              </ReorderItem>
            );
          })}
        </Reorder>

        <Button
          onClick={() => addPlayer('' as PlayerName)}
          variant='secondary'
          className='self-center'
        >
          <UserPlusIcon aria-hidden='true' />
          Add player
        </Button>
      </CardContent>
    </Card>
  );
}
