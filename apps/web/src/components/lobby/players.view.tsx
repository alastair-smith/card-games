import { CrownIcon, EllipsisVertical, UserIcon } from 'lucide-react';
import { useMemo } from 'react';
import type { UserId } from '~/types/entities';
import type { Player } from '~/types/game';
import { cn } from '~/utils/cn';
import {
  PLAYER_COLOR_OPTIONS,
  type PlayerColor,
  playerColorValue,
} from '~/utils/player-color';
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
} from '../ui/alert-dialog';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { ColorPicker } from '../ui/color-picker';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Input } from '../ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Switch } from '../ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

function PlayerDropdown({
  className,
  player,
  userIsHost,
  handleLeave,
  handleKick,
  handleMakeHost,
}: {
  className?: string;
  player: Player;
  userIsHost: boolean;
  handleLeave: (userId: UserId) => void;
  handleKick: (userId: UserId) => void;
  handleMakeHost: (userId: UserId) => void;
}) {
  const showLeave = player.isUser;
  const showKick = userIsHost && !player.isUser;
  const showMakeHost = userIsHost && !player.isHost;

  if (!showLeave && !showKick && !showMakeHost) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='secondary' size='icon'>
          <EllipsisVertical className={className} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        {showLeave && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
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
                  onClick={() => handleLeave(player.id)}
                  variant='danger'
                >
                  Leave
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {showKick && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
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
                <AlertDialogAction onClick={() => handleKick(player.id)}>
                  Kick
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {showMakeHost && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
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
                <AlertDialogAction onClick={() => handleMakeHost(player.id)}>
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

function ColourSwatch({
  color,
  className,
}: {
  color: PlayerColor;
  className?: string;
}) {
  return (
    <span
      className={cn('block size-6 rounded border border-border', className)}
      style={{ backgroundColor: playerColorValue(color) }}
    />
  );
}

function PlayerColour({
  color,
  isUser,
  takenColors,
  handleColorChange,
}: {
  color: PlayerColor;
  isUser: boolean;
  takenColors?: PlayerColor[];
  handleColorChange?: (color: string) => void;
}) {
  if (!isUser || !handleColorChange) {
    return (
      // Match the icon button's footprint so swatches line up with the picker.
      <span className='flex h-10 w-10 items-center justify-center border-2 border-transparent'>
        <ColourSwatch color={color} />
        <span className='sr-only'>Player colour</span>
      </span>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='secondary' size='icon' aria-label='Change your colour'>
          <ColourSwatch color={color} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        // Let the picker focus its active swatch instead of the popover
        // container, so arrow-key navigation between colours works immediately.
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <ColorPicker
          colors={PLAYER_COLOR_OPTIONS}
          value={color}
          disabledColors={takenColors}
          onColorSelect={handleColorChange}
        />
      </PopoverContent>
    </Popover>
  );
}

function getButtonText({
  userIsHost,
  requiredPlayers,
  playersReady,
  playerCount,
}: {
  userIsHost: boolean;
  requiredPlayers: number;
  playersReady: number;
  playerCount: number;
}) {
  if (requiredPlayers > 0) {
    return `Need ${requiredPlayers} more player(s)`;
  }
  if (playersReady !== playerCount) {
    return `${playersReady}/${playerCount} players ready`;
  }
  if (userIsHost) {
    return 'Start Game';
  }
  return 'Awaiting Host';
}

export type PlayersProps = {
  className?: string;
  players: Player[];
  minPlayers: number;
  maxPlayers: number;
  user: {
    isReady: boolean;
    name: string;
    nameError: string;
    color?: PlayerColor;
  };
  handleNameChange: (name: string) => void;
  handleReadyChange: (readyStatus: boolean) => void;
  handleColorChange?: (color: string) => void;
  handleStartGame: () => void;
  handleLeave: (userId: UserId) => void;
  handleKick: (userId: UserId) => void;
  handleMakeHost: (userId: UserId) => void;
};

export default function Players({
  className,
  players,
  minPlayers,
  maxPlayers,
  user,
  handleNameChange,
  handleReadyChange,
  handleColorChange,
  handleStartGame,
  handleLeave,
  handleKick,
  handleMakeHost,
}: PlayersProps) {
  const requiredPlayers = Math.max(minPlayers - players.length, 0);
  const optionalPlayers = maxPlayers - (players.length + requiredPlayers);

  const userIsHost = useMemo(
    () => players.some(({ isHost, isUser }) => isHost && isUser),
    [players],
  );
  const playersReady = useMemo(
    () => players.filter((player) => player.isReady).length,
    [players],
  );

  const buttonText = getButtonText({
    userIsHost,
    requiredPlayers,
    playersReady,
    playerCount: players.length,
  });

  return (
    <Card className={className}>
      <CardHeader>
        <h2 className='text-xl font-semibold'>Players</h2>
      </CardHeader>
      <CardContent>
        <div className='flex flex-col sm:hidden divide-y'>
          {players.map((player) => (
            <div
              key={player.id}
              className='flex flex-col items-start gap-4 py-8'
            >
              {player.isHost ? (
                <div className='flex gap-2 items-center'>
                  <CrownIcon size={22} />
                  <span>Host</span>
                </div>
              ) : (
                ''
              )}
              {player.isUser ? (
                <Input
                  value={user.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
              ) : (
                <div className='w-full overflow-hidden'>
                  <span className='truncate block'>{player.name}</span>
                </div>
              )}
              <div className='flex gap-2 items-center justify-between w-full'>
                <div className='flex gap-4 items-center'>
                  <div className='flex gap-2 items-center'>
                    <span>Colour</span>
                    <PlayerColour
                      color={
                        player.isUser
                          ? (user.color ?? player.color)
                          : player.color
                      }
                      isUser={player.isUser}
                      takenColors={players
                        .filter((other) => other.id !== player.id)
                        .map((other) => other.color)}
                      handleColorChange={handleColorChange}
                    />
                  </div>
                  <div className='flex gap-2 items-center'>
                    <span>Ready</span>
                    <Switch
                      disabled={!player.isUser}
                      checked={player.isUser ? user.isReady : player.isReady}
                      onCheckedChange={handleReadyChange}
                    />
                  </div>
                </div>
                <PlayerDropdown
                  player={player}
                  userIsHost={userIsHost}
                  handleLeave={handleLeave}
                  handleKick={handleKick}
                  handleMakeHost={handleMakeHost}
                />
              </div>
            </div>
          ))}

          {Array.from({ length: requiredPlayers }).map((_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: placholder row
            <div key={index} className='flex justify-center gap-4 py-4'>
              <UserIcon size={22} />
              <span>Required Player</span>
            </div>
          ))}

          {Array.from({ length: optionalPlayers }).map((_, index) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: placholder row
              key={index}
              className='flex justify-center gap-4 opacity-50 py-4'
            >
              <UserIcon size={22} />
              <span>Optional Player</span>
            </div>
          ))}
        </div>
        <Table className='hidden sm:table'>
          <TableHeader>
            <TableRow>
              <TableHead className='sr-only w-[1ch]'>Host</TableHead>
              <TableHead className='pl-7'>Name</TableHead>
              <TableHead>Colour</TableHead>
              <TableHead>Ready</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((player) => (
              <TableRow key={player.id} className='sm:h-[calc(4.5rem+1px)]'>
                <TableCell className='w-[1ch]'>
                  {player.isHost ? (
                    <>
                      <CrownIcon size={22} />
                      <span className='sr-only'>Is host</span>
                    </>
                  ) : (
                    ''
                  )}
                </TableCell>
                <TableCell>
                  {player.isUser ? (
                    <Input
                      value={user.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                    />
                  ) : (
                    <span className='border border-transparent px-3'>
                      {player.name}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <PlayerColour
                    color={
                      player.isUser
                        ? (user.color ?? player.color)
                        : player.color
                    }
                    isUser={player.isUser}
                    takenColors={players
                      .filter((other) => other.id !== player.id)
                      .map((other) => other.color)}
                    handleColorChange={handleColorChange}
                  />
                </TableCell>
                <TableCell>
                  <Switch
                    disabled={!player.isUser}
                    checked={player.isUser ? user.isReady : player.isReady}
                    onCheckedChange={handleReadyChange}
                  />
                </TableCell>
                <TableCell>
                  <PlayerDropdown
                    player={player}
                    userIsHost={userIsHost}
                    handleLeave={handleLeave}
                    handleKick={handleKick}
                    handleMakeHost={handleMakeHost}
                  />
                </TableCell>
              </TableRow>
            ))}

            {Array.from({ length: requiredPlayers }).map((_, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: rows are duplicates
              <TableRow key={index} className='sm:h-[calc(4.5rem+1px)]'>
                <TableCell colSpan={5}>
                  <div className='flex justify-center gap-4'>
                    <UserIcon size={22} />
                    <span>Required Player</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {Array.from({ length: optionalPlayers }).map((_, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: rows are duplicates
              <TableRow key={index} className='sm:h-[calc(4.5rem+1px)]'>
                <TableCell colSpan={5}>
                  <div className='flex justify-center gap-4 opacity-50'>
                    <UserIcon size={22} />
                    <span>Optional Player</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className='flex gap-4 justify-end'>
        <Button
          disabled={buttonText !== 'Start Game'}
          onClick={() => handleStartGame()}
        >
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
}
