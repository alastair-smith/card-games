import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { cn } from '~/utils/cn';
import type {
  ScoreboardPlayer,
  ScoreboardRound,
} from '../../_hooks/useYanivScoreboard';
import type { GameSummary } from '../../_libs/derive-game-summary';
import { getPlayerTotal, getRoundHalving } from '../../_libs/read-game-summary';

type ScoreTableProps = {
  players: ScoreboardPlayer[];
  rounds: ScoreboardRound[];
  gameSummary: GameSummary;
  /** The round on show in the carousel, counting from one. */
  currentRoundNumber?: number;
  className?: string;
};

/**
 * The whole game at a glance, for screens with the room for it. Read only —
 * scores are entered a round at a time alongside.
 */
export default function ScoreTable({
  players,
  rounds,
  gameSummary,
  currentRoundNumber,
  className,
}: ScoreTableProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Scores</CardTitle>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Round</TableHead>
              {players.map((player) => (
                <TableHead key={player.id}>{player.name}</TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {rounds.map((round, roundIndex) => (
              <TableRow
                key={round.id}
                aria-current={
                  currentRoundNumber === roundIndex + 1 ? 'true' : undefined
                }
                className={cn(
                  currentRoundNumber === roundIndex + 1 && 'bg-highlight',
                )}
              >
                <TableCell>{roundIndex + 1}</TableCell>

                {players.map((player) => {
                  const handTotal = round.handTotals[player.id];
                  const halvedAt = getRoundHalving(
                    gameSummary,
                    round.id,
                    player.id,
                  );

                  return (
                    <TableCell key={player.id}>
                      {handTotal ?? '–'}
                      {halvedAt && (
                        <span className='ml-1 text-sm'>
                          halved at {halvedAt}
                        </span>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TableCell>Total</TableCell>
              {players.map((player) => (
                <TableCell key={player.id}>
                  {getPlayerTotal(gameSummary, player.id)}
                </TableCell>
              ))}
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}
