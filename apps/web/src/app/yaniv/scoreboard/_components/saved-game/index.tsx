import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
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

/** Offers the players the game left behind the last time they were here. */
export default function SavedGame({
  players,
  gameSummary,
  onContinue,
  onStartNew,
  onStartNewWithSamePlayers,
}: SavedGameProps) {
  // A game already won has nothing left to play, so it is only worth keeping
  // the players.
  const isGameFinished = gameSummary.isGameOver;

  const rankedPlayers = [...players]
    .map((player) => ({
      ...player,
      total: getPlayerTotal(gameSummary, player.id),
    }))
    .sort((player, otherPlayer) => player.total - otherPlayer.total);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isGameFinished ? 'Previous game' : 'Game in progress'}
        </CardTitle>
      </CardHeader>

      <CardContent className='flex flex-col gap-6'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player</TableHead>
              <TableHead>Score</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {rankedPlayers.map(({ id, name, total }) => (
              <TableRow key={id}>
                <TableCell>{name}</TableCell>
                <TableCell>{total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className='flex flex-col gap-3'>
          {!isGameFinished && (
            <Button onClick={onContinue}>Continue game</Button>
          )}

          <Button
            variant={isGameFinished ? 'default' : 'secondary'}
            onClick={onStartNewWithSamePlayers}
          >
            Play again
          </Button>

          <Button variant='secondary' onClick={onStartNew}>
            New game
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
