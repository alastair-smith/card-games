import { useId } from 'react';
import type { Player } from '~/types/game';
import { cn } from '~/utils/cn';
import { PLAYER_COLOR_OPTIONS, type PlayerColor } from '~/utils/player-color';
import { ColorPicker } from '../ui/color-picker';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { PlayerNameInput } from './player-name-input';
import StartGameButton from './start-game-button';

export default function ReadyBar({
  className,
  players,
  minPlayers,
  name,
  color,
  isReady,
  onNameChange,
  onColorChange,
  onReadyChange,
  onStartGame,
}: {
  className?: string;
  players: Player[];
  minPlayers: number;
  name: string;
  color: PlayerColor;
  isReady: boolean;
  onNameChange: (name: string) => void;
  onColorChange: (color: string) => void;
  onReadyChange: (isReady: boolean) => void;
  onStartGame: () => void;
}) {
  const readySwitchId = useId();
  const takenColors = players
    .filter((player) => !player.isUser)
    .map((player) => player.color);

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      <div className='flex flex-1 basis-60 items-center gap-2'>
        <ColorPicker
          label='Change your colour'
          colors={PLAYER_COLOR_OPTIONS}
          value={color}
          disabledColors={takenColors}
          onColorSelect={onColorChange}
        />
        <PlayerNameInput
          className='max-w-xs'
          name={name}
          onNameChange={onNameChange}
        />
      </div>
      <div className='flex grow items-center justify-between gap-3 sm:grow-0'>
        <div className='flex items-center gap-2'>
          <Label htmlFor={readySwitchId}>Ready</Label>
          <Switch
            id={readySwitchId}
            checked={isReady}
            onCheckedChange={onReadyChange}
          />
        </div>
        <StartGameButton
          players={players}
          minPlayers={minPlayers}
          onStartGame={onStartGame}
        />
      </div>
    </div>
  );
}
