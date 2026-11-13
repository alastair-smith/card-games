import { EllipsisVerticalIcon } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import type { PlayerName, UserId } from '~/types/entities';
import type { Player } from '~/types/game';
import { cn } from '~/utils/cn';
import { type PlayerColor, playerColorValue } from '~/utils/player-color';

const getPlayerActions = (player: Player, isUserHost: boolean) => ({
  isLeaveShown: player.isUser,
  isKickShown: isUserHost && !player.isUser,
  isMakeHostShown: isUserHost && !player.isHost,
});

export const hasPlayerActions = (player: Player, isUserHost: boolean) =>
  Object.values(getPlayerActions(player, isUserHost)).some(Boolean);

/** A ⋮ button in a player's colour, to join to their tag in a `ButtonGroup`. */
export function PlayerActionsButton({
  className,
  name,
  color,
  ...buttonProps
}: Omit<ComponentProps<typeof Button>, 'color' | 'children'> & {
  name: PlayerName;
  color: PlayerColor;
}) {
  return (
    <Button
      variant='secondary'
      size='icon'
      style={{ backgroundColor: playerColorValue(color) }}
      className={cn(
        'h-auto w-7 border-white text-white hover:brightness-110 sm:w-8',
        className,
      )}
      {...buttonProps}
    >
      <EllipsisVerticalIcon
        strokeWidth={3}
        aria-hidden='true'
        className='icon-outline-black'
      />
      <span className='sr-only'>Actions for {name}</span>
    </Button>
  );
}

/** Leave, kick and make-host actions for a player, opened from `children`. */
export function PlayerActionsMenu({
  children,
  player,
  isUserHost,
  onLeave,
  onKick,
  onMakeHost,
}: {
  children: ReactNode;
  player: Player;
  isUserHost: boolean;
  onLeave: (userId: UserId) => void;
  onKick: (userId: UserId) => void;
  onMakeHost: (userId: UserId) => void;
}) {
  const { isLeaveShown, isKickShown, isMakeHostShown } = getPlayerActions(
    player,
    isUserHost,
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>

      <DropdownMenuContent>
        {isLeaveShown && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                Leave
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Are you sure you want to leave the game?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  You can rejoin by re-visiting the url.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Stay</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onLeave(player.id)}
                  variant='danger'
                >
                  Leave
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {isKickShown && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                Kick
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Kick <span className='font-semibold'>{player.name}</span> from
                  the game?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  They will be able to rejoin by re-visiting the url.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onKick(player.id)}>
                  Kick
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {isMakeHostShown && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                Make Host
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Make <span className='font-semibold'>{player.name}</span> the
                  new host?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  You will remain in the game, but lose host powers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onMakeHost(player.id)}>
                  Make Host
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
