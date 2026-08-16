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
import {
  getPlayerRoundTotal,
  getPlayerTotal,
  getRoundHalving,
} from '../../_libs/read-game-summary';

type ScoreTableProps = {
  players: ScoreboardPlayer[];
  rounds: ScoreboardRound[];
  gameSummary: GameSummary;
  /** The round on show in the carousel, counting from one. */
  currentRoundNumber?: number;
  onRoundSelect: (roundNumber: number) => void;
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
  onRoundSelect,
  className,
}: ScoreTableProps) {
  return (
    // The heading stays put and the rounds scroll beneath it, so a game long
    // enough to outgrow the card does not carry the page along with it.
    <Card className={cn('flex flex-col overflow-hidden', className)}>
      <CardHeader className='shrink-0'>
        <CardTitle>Scores</CardTitle>
      </CardHeader>

      <CardContent className='min-h-0 flex-1 overflow-y-auto'>
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
            {rounds.map((round, roundIndex) => {
              const isCurrentRound = currentRoundNumber === roundIndex + 1;

              return (
                <TableRow
                  key={round.id}
                  aria-current={isCurrentRound ? 'true' : undefined}
                  className={cn(
                    'cursor-pointer',
                    isCurrentRound ? 'bg-highlight' : 'hover:bg-highlight/50',
                  )}
                  onClick={() => onRoundSelect(roundIndex + 1)}
                >
                  <TableCell>
                    {/* The row is the target for a pointer, and this carries
                        the same journey for a keyboard, its click bubbling. */}
                    <button
                      type='button'
                      aria-label={`Go to round ${roundIndex + 1}`}
                    >
                      {roundIndex + 1}
                    </button>
                  </TableCell>

                  {players.map((player) => {
                    const handTotal = round.handTotals[player.id];
                    const runningTotal = getPlayerRoundTotal(
                      gameSummary,
                      round.id,
                      player.id,
                    );
                    const halvedAt = getRoundHalving(
                      gameSummary,
                      round.id,
                      player.id,
                    );

                    return (
                      <TableCell key={player.id}>
                        {handTotal ?? '–'}
                        {/* The hand is the score entered, the total beside it
                            is where that left the player. A round that has not
                            been scored has no total to show: one still being
                            entered, or one played out after the game had
                            already been won. */}
                        {runningTotal !== null && (
                          <span className='text-sm text-light-text-disabled'>
                            {' '}
                            ({runningTotal})
                          </span>
                        )}
                        {halvedAt && (
                          <span className='text-sm'> halved at {halvedAt}</span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
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
