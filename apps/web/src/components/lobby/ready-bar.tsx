import { useId } from 'react';
import type { Player } from '~/types/game';
import { cn } from '~/utils/cn';
import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import StartGameButton from './start-game-button';

export default function ReadyBar({
  className,
  players,
  minPlayers,
  isReady,
  onReadyChange,
  onStartGame,
}: {
  className?: string;
  players: Player[];
  minPlayers: number;
  isReady: boolean;
  onReadyChange: (isReady: boolean) => void;
  onStartGame: () => void;
}) {
  const readySwitchId = useId();

  return (
    <Card
      variant='panel'
      className={cn(
        'flex items-center justify-between gap-3 p-3 shadow-lg',
        className,
      )}
    >
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
    </Card>
  );
}
