import { useId } from 'react';
import { PlayerNameInput } from '~/components/lobby/player-name-input';
import StartGameButton from '~/components/lobby/start-game-button';
import { ColorPicker } from '~/components/ui/color-picker';
import { Label } from '~/components/ui/label';
import { Switch } from '~/components/ui/switch';
import type { Player } from '~/types/game';
import { cn } from '~/utils/cn';
import { PLAYER_COLOR_OPTIONS, type PlayerColor } from '~/utils/player-color';

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
      <div className='flex w-full items-center gap-2 sm:w-auto'>
        <ColorPicker
          label='Change your colour'
          colors={PLAYER_COLOR_OPTIONS}
          value={color}
          disabledColors={takenColors}
          onColorSelect={onColorChange}
        />
        <PlayerNameInput
          className='max-w-xs sm:w-60 lg:w-xs'
          name={name}
          onNameChange={onNameChange}
        />
      </div>
      {/* Before Start, so its changing text doesn't move the switch */}
      <div className='flex items-center gap-2'>
        <Label htmlFor={readySwitchId}>Ready</Label>
        <Switch
          id={readySwitchId}
          checked={isReady}
          onCheckedChange={onReadyChange}
        />
      </div>
      <StartGameButton
        className='ml-auto'
        players={players}
        minPlayers={minPlayers}
        onStartGame={onStartGame}
      />
    </div>
  );
}
