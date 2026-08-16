import { Fragment } from 'react';
import { Button } from '~/components/ui/button';
import type { ScoreboardPlayer } from '../../_hooks/useYanivScoreboard';
import type { GameSummary } from '../../_libs/derive-game-summary';
import { getPlayerTotal } from '../../_libs/read-game-summary';

export type SavedGameProps = {
  players: ScoreboardPlayer[];
  gameSummary: GameSummary;
  onContinue: () => void;
  onStartNew: () => void;
  onStartNewWithSamePlayers: () => void;
};

/** Offers the players the game left in progress the last time they were here. */
export default function SavedGame({
  players,
  gameSummary,
  onContinue,
  onStartNew,
  onStartNewWithSamePlayers,
}: SavedGameProps) {
  return (
    <div>
      <h2>You have a game in progress</h2>

      <dl>
        {players.map((player) => (
          <Fragment key={player.id}>
            <dt>{player.name}</dt>
            <dd>{getPlayerTotal(gameSummary, player.id)}</dd>
          </Fragment>
        ))}
      </dl>

      <Button onClick={onContinue}>Continue game</Button>
      <Button onClick={onStartNew}>Start new game</Button>
      <Button onClick={onStartNewWithSamePlayers}>
        Start new game with same players
      </Button>
    </div>
  );
}
