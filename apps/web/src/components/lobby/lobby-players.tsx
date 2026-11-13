import {
  CheckIcon,
  CrownIcon,
  EllipsisVerticalIcon,
  PauseIcon,
} from 'lucide-react';
import type { UserId } from '~/types/entities';
import type { Player } from '~/types/game';
import { cn } from '~/utils/cn';
import { PlayerTag } from '../player-tag';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { hasPlayerActions, PlayerActionsMenu } from './player-actions-menu';

function ReadyBadge({ isReady }: { isReady: boolean }) {
  return (
    <span
      className={cn(
        'flex size-5 shrink-0 items-center justify-center rounded-full',
        isReady
          ? 'bg-primary text-light-text'
          : 'border-2 border-(--card-muted-text) text-(--card-muted-text)',
      )}
    >
      {isReady ? (
        <CheckIcon size={14} strokeWidth={3} aria-hidden='true' />
      ) : (
        <PauseIcon size={12} strokeWidth={3} aria-hidden='true' />
      )}
      <span className='sr-only'>{isReady ? 'Ready' : 'Not ready'}</span>
    </span>
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
            <li key={player.id} className='flex items-center gap-1.5'>
              {player.isHost && (
                <>
                  <CrownIcon size={18} aria-hidden='true' />
                  <span className='sr-only'>Host:</span>
                </>
              )}
              <PlayerTag
                name={player.name}
                color={player.color}
                isUser={player.isUser}
                isPlayersTurn={false}
              />
              <ReadyBadge isReady={player.isReady} />
              {hasPlayerActions(player, isUserHost) && (
                <PlayerActionsMenu
                  player={player}
                  isUserHost={isUserHost}
                  onLeave={onLeave}
                  onKick={onKick}
                  onMakeHost={onMakeHost}
                >
                  <Button variant='secondary' size='icon' className='h-8 w-8'>
                    <EllipsisVerticalIcon aria-hidden='true' />
                    <span className='sr-only'>Actions for {player.name}</span>
                  </Button>
                </PlayerActionsMenu>
              )}
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
