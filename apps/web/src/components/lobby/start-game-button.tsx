import type { Player } from '~/types/game';
import { Button } from '../ui/button';

function getButtonText({
  isUserHost,
  requiredPlayers,
  playersReady,
  playerCount,
}: {
  isUserHost: boolean;
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
  if (isUserHost) {
    return 'Start Game';
  }
  return 'Awaiting Host';
}

export default function StartGameButton({
  className,
  players,
  minPlayers,
  onStartGame,
}: {
  className?: string;
  players: Player[];
  minPlayers: number;
  onStartGame: () => void;
}) {
  const buttonText = getButtonText({
    isUserHost: players.some(({ isHost, isUser }) => isHost && isUser),
    requiredPlayers: Math.max(minPlayers - players.length, 0),
    playersReady: players.filter((player) => player.isReady).length,
    playerCount: players.length,
  });

  return (
    <Button
      className={className}
      disabled={buttonText !== 'Start Game'}
      onClick={() => onStartGame()}
    >
      {buttonText}
    </Button>
  );
}
