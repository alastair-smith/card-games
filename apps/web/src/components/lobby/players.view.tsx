import { CrownIcon, EllipsisVertical, UserIcon } from 'lucide-react';
import { type ReactNode, useMemo } from 'react';
import type { UserId } from '~/types/entities';
import type { Player } from '~/types/game';
import {
  PLAYER_COLOR_OPTIONS,
  type PlayerColor,
  playerColorValue,
} from '~/utils/player-color';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { ColorPicker, ColorSwatch } from '../ui/color-picker';
import { Switch } from '../ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { hasPlayerActions, PlayerActionsMenu } from './player-actions-menu';
import { PlayerNameInput } from './player-name-input';

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
  if (!hasPlayerActions(player, userIsHost)) {
    return null;
  }

  return (
    <PlayerActionsMenu
      player={player}
      isUserHost={userIsHost}
      onLeave={handleLeave}
      onKick={handleKick}
      onMakeHost={handleMakeHost}
    >
      <Button variant='secondary' size='icon'>
        <EllipsisVertical className={className} />
      </Button>
    </PlayerActionsMenu>
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
  handleColorChange?: ((color: string) => void) | undefined;
}) {
  if (!isUser || !handleColorChange) {
    return (
      // Match the icon button's footprint so swatches line up with the picker.
      <span className='flex h-10 w-10 items-center justify-center border-2 border-transparent'>
        <ColorSwatch color={playerColorValue(color)} />
        <span className='sr-only'>Player colour</span>
      </span>
    );
  }

  return (
    <ColorPicker
      label='Change your colour'
      colors={PLAYER_COLOR_OPTIONS}
      value={color}
      disabledColors={takenColors}
      onColorSelect={handleColorChange}
    />
  );
}

export type PlayersProps = {
  className?: string;
  /** Shown in the card's footer, such as a `StartGameButton` */
  children?: ReactNode;
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
  handleLeave: (userId: UserId) => void;
  handleKick: (userId: UserId) => void;
  handleMakeHost: (userId: UserId) => void;
};

export default function Players({
  className,
  children,
  players,
  minPlayers,
  maxPlayers,
  user,
  handleNameChange,
  handleReadyChange,
  handleColorChange,
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
                <PlayerNameInput
                  name={user.name}
                  onNameChange={handleNameChange}
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
              className='flex justify-center gap-4 text-light-text-disabled py-4'
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
                    <PlayerNameInput
                      name={user.name}
                      onNameChange={handleNameChange}
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
                  <div className='flex justify-center gap-4 text-light-text-disabled'>
                    <UserIcon size={22} />
                    <span>Optional Player</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      {children && (
        <CardFooter className='flex gap-4 justify-end'>{children}</CardFooter>
      )}
    </Card>
  );
}
