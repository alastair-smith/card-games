import { CheckIcon, CrownIcon, XIcon } from 'lucide-react';
import type { UserId } from '~/types/entities';
import type { Player } from '~/types/game';
import { cn } from '~/utils/cn';
import { PlayerTag } from '../player-tag';
import { Card, CardContent, CardHeader } from '../ui/card';
import { hasPlayerActions, PlayerActionsMenu } from './player-actions-menu';

function ReadyBadge({ isReady }: { isReady: boolean }) {
  return (
    <span
      className={cn(
        'flex size-5 shrink-0 items-center justify-center rounded-full text-white',
        isReady ? 'bg-lifted-green' : 'bg-light-slate',
      )}
    >
      {isReady ? (
        <CheckIcon size={14} strokeWidth={3} aria-hidden='true' />
      ) : (
        <XIcon size={14} strokeWidth={3} aria-hidden='true' />
      )}
      <span className='sr-only'>{isReady ? 'Ready' : 'Not ready'}</span>
    </span>
  );
}

export default function LobbyPlayers({
  className,
  players,
  maxPlayers,
  onLeave,
  onKick,
  onMakeHost,
}: {
  className?: string;
  players: Player[];
  maxPlayers: number;
  onLeave: (userId: UserId) => void;
  onKick: (userId: UserId) => void;
  onMakeHost: (userId: UserId) => void;
}) {
  const isUserHost = players.some(({ isHost, isUser }) => isHost && isUser);
  const openSeats = Math.max(maxPlayers - players.length, 0);

  return (
    <Card className={className}>
      <CardHeader>
        <h2 className='text-xl font-semibold'>
          Players {players.length}/{maxPlayers}
        </h2>
      </CardHeader>
      <CardContent>
        <ul className='flex flex-wrap items-center gap-x-5 gap-y-3'>
          {players.map((player) => {
            const tag = (
              <PlayerTag
                name={player.name}
                color={player.color}
                isUser={player.isUser}
                isPlayersTurn={false}
              />
            );

            return (
              <li key={player.id} className='flex items-center gap-1.5'>
                {player.isHost && (
                  <>
                    <CrownIcon size={18} aria-hidden='true' />
                    <span className='sr-only'>Host:</span>
                  </>
                )}
                {hasPlayerActions(player, isUserHost) ? (
                  <PlayerActionsMenu
                    player={player}
                    isUserHost={isUserHost}
                    onLeave={onLeave}
                    onKick={onKick}
                    onMakeHost={onMakeHost}
                  >
                    <button
                      type='button'
                      className='cursor-pointer rounded focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring'
                    >
                      {tag}
                    </button>
                  </PlayerActionsMenu>
                ) : (
                  tag
                )}
                <ReadyBadge isReady={player.isReady} />
              </li>
            );
          })}
          {Array.from({ length: openSeats }).map((_, index) => (
            <li
              // biome-ignore lint/suspicious/noArrayIndexKey: open seats are identical
              key={index}
              className='rounded border-2 border-dashed border-light-slate px-2 py-0.5 text-xs text-light-text-disabled sm:py-1 sm:text-sm'
            >
              Open seat
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
