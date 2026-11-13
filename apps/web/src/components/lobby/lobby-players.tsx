import { CheckIcon, EllipsisVerticalIcon, HourglassIcon } from 'lucide-react';
import type { UserId } from '~/types/entities';
import type { Player } from '~/types/game';
import { playerColorValue } from '~/utils/player-color';
import { PlayerTag } from '../player-tag';
import { Button } from '../ui/button';
import { ButtonGroup } from '../ui/button-group';
import { Card, CardContent, CardHeader } from '../ui/card';
import { hasPlayerActions, PlayerActionsMenu } from './player-actions-menu';

function ReadyStatus({ isReady }: { isReady: boolean }) {
  const Icon = isReady ? CheckIcon : HourglassIcon;

  return (
    <>
      <Icon
        size='1.15em'
        strokeWidth={isReady ? 3.5 : 2.5}
        aria-hidden='true'
        className='shrink-0 text-white icon-outline-black'
      />
      <span className='sr-only'>{isReady ? ', ready' : ', not ready'}</span>
    </>
  );
}

export default function LobbyPlayers({
  className,
  players,
  minPlayers,
  maxPlayers,
  onLeave,
  onKick,
  onMakeHost,
}: {
  className?: string;
  players: Player[];
  minPlayers: number;
  maxPlayers: number;
  onLeave: (userId: UserId) => void;
  onKick: (userId: UserId) => void;
  onMakeHost: (userId: UserId) => void;
}) {
  const isUserHost = players.some(({ isHost, isUser }) => isHost && isUser);
  const requiredSeats = Math.max(minPlayers - players.length, 0);
  const optionalSeats = Math.max(
    maxPlayers - players.length - requiredSeats,
    0,
  );

  return (
    <Card variant='panel' className={className}>
      <CardHeader>
        <h2 className='text-xl font-semibold'>
          Players {players.length}/{maxPlayers}
        </h2>
      </CardHeader>
      <CardContent>
        <ul className='flex flex-wrap items-center gap-x-5 gap-y-3'>
          {players.map((player) => (
            <li key={player.id} className='flex'>
              <ButtonGroup>
                <PlayerTag
                  name={player.name}
                  color={player.color}
                  isUser={player.isUser}
                  isHost={player.isHost}
                  isPlayersTurn={false}
                >
                  <ReadyStatus isReady={player.isReady} />
                </PlayerTag>
                {hasPlayerActions(player, isUserHost) && (
                  <PlayerActionsMenu
                    player={player}
                    isUserHost={isUserHost}
                    onLeave={onLeave}
                    onKick={onKick}
                    onMakeHost={onMakeHost}
                  >
                    <Button
                      variant='secondary'
                      size='icon'
                      style={{
                        backgroundColor: playerColorValue(player.color),
                      }}
                      className='h-auto w-7 border-white text-white hover:brightness-110 sm:w-8'
                    >
                      <EllipsisVerticalIcon
                        strokeWidth={3}
                        aria-hidden='true'
                        className='icon-outline-black'
                      />
                      <span className='sr-only'>Actions for {player.name}</span>
                    </Button>
                  </PlayerActionsMenu>
                )}
              </ButtonGroup>
            </li>
          ))}
          {Array.from({ length: requiredSeats }).map((_, index) => (
            <li
              // biome-ignore lint/suspicious/noArrayIndexKey: empty seats are identical
              key={`required-${index}`}
              className='rounded border-2 border-dashed border-current px-2 py-0.5 text-xs sm:py-1 sm:text-sm'
            >
              Required player
            </li>
          ))}
          {Array.from({ length: optionalSeats }).map((_, index) => (
            <li
              // biome-ignore lint/suspicious/noArrayIndexKey: empty seats are identical
              key={`optional-${index}`}
              className='rounded border-2 border-dashed border-(--card-muted-text) px-2 py-0.5 text-xs text-(--card-muted-text) sm:py-1 sm:text-sm'
            >
              Optional player
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
