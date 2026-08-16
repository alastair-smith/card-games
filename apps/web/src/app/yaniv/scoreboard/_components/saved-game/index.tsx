import { Button } from '~/components/ui/button';

export type SavedGameProps = {
  onContinue: () => void;
  onStartNew: () => void;
  onStartNewWithSamePlayers: () => void;
};

/** Offers the players the game left in progress the last time they were here. */
export default function SavedGame({
  onContinue,
  onStartNew,
  onStartNewWithSamePlayers,
}: SavedGameProps) {
  return (
    <div>
      <h2>You have a game in progress</h2>

      {/* TODO: list the players and their scores as the game was left. */}

      <Button onClick={onContinue}>Continue game</Button>
      <Button onClick={onStartNew}>Start new game</Button>
      <Button onClick={onStartNewWithSamePlayers}>
        Start new game with same players
      </Button>
    </div>
  );
}
