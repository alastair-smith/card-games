import type { ReactNode } from 'react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import type { UserId } from '~/types/entities';
import type { Player } from '~/types/game';

const getPlayerActions = (player: Player, isUserHost: boolean) => ({
  isLeaveShown: player.isUser,
  isKickShown: isUserHost && !player.isUser,
  isMakeHostShown: isUserHost && !player.isHost,
});

export const hasPlayerActions = (player: Player, isUserHost: boolean) =>
  Object.values(getPlayerActions(player, isUserHost)).some(Boolean);

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
