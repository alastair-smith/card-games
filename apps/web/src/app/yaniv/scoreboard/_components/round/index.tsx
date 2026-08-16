import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import type { UserId } from '~/types/entities';
import type {
  ScoreboardPlayer,
  ScoreboardRound,
} from '../../_hooks/useYanivScoreboard';
import {
  type GameSummary,
  previewRound,
} from '../../_libs/derive-game-summary';
import {
  getHalvingTarget,
  getPlayerTotal,
  hasHalvedFiftyScore,
  hasHalvedHundredScore,
} from '../../_libs/read-game-summary';
import FieldError from '../field-error';
import HalvingMarkers from '../halving-markers';

type RoundProps = {
  players: ScoreboardPlayer[];
  round: ScoreboardRound;
  /** Which round of the game this is, counting from one. */
  roundNumber: number;
  gameSummary: GameSummary;
  /** What each player still needs before the round can be finished, if anything. */
  errors?: Partial<Record<UserId, string>>;
  onScoreChange: (playerId: UserId, handTotal: number | null) => void;
};

export default function Round({
  players,
  round,
  roundNumber,
  gameSummary,
  errors,
  onScoreChange,
}: RoundProps) {
  const scoreChangeHandler =
    (playerId: UserId) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;

      // Emptying the box clears the score, so a mistake can be backspaced away
      // and typed again rather than only overwritten.
      if (value === '') {
        onScoreChange(playerId, null);
        return;
      }

      const handTotal = Number(value);
      if (Number.isNaN(handTotal)) return;

      onScoreChange(playerId, handTotal);
    };

  // Where the players stand as of this round, so the totals and the halving
  // markers keep up with the scores while they are still being typed.
  const roundSummary: GameSummary = round.isComplete
    ? {
        ...gameSummary,
        players:
          gameSummary.byRound.find(({ roundId }) => roundId === round.id)
            ?.players ?? gameSummary.players,
      }
    : { ...gameSummary, players: previewRound(gameSummary, round, players) };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Round {roundNumber}</CardTitle>
      </CardHeader>

      <CardContent>
        <ul className='flex flex-col gap-3'>
          {players.map((player) => {
            const total = getPlayerTotal(roundSummary, player.id);
            const halvingTarget = getHalvingTarget(roundSummary, player.id);
            const error = errors?.[player.id];
            const errorId = `round-${round.id}-player-${player.id}-error`;

            return (
              <li
                key={player.id}
                className='flex items-stretch overflow-hidden rounded-md border-2 border-border bg-highlighted-card-background'
              >
                {/* No padding or gaps on the row itself, so every line runs
                    edge to edge and meets the ones it crosses. */}
                <div className='flex flex-1 flex-col justify-center'>
                  <span className='border-b border-border px-2 py-1 text-lg font-medium'>
                    {player.name}
                  </span>
                  <span className='flex-1 bg-white/20 px-2 py-1 text-sm font-semibold'>
                    Total: {total}
                  </span>
                </div>

                <div className='flex flex-col items-end justify-center gap-0.5 border-x border-border bg-white/20 px-2 py-1 text-sm'>
                  {halvingTarget && (
                    <span>
                      {Math.abs(halvingTarget.away)}{' '}
                      {halvingTarget.away >= 0 ? 'from' : 'beyond'}{' '}
                      {halvingTarget.target}
                    </span>
                  )}

                  <HalvingMarkers
                    isFiftyScoreHalved={hasHalvedFiftyScore(
                      roundSummary,
                      player.id,
                    )}
                    isHundredScoreHalved={hasHalvedHundredScore(
                      roundSummary,
                      player.id,
                    )}
                  />
                </div>

                <div className='flex w-24 flex-col justify-center gap-0.5 bg-white/20 px-2 py-1'>
                  <Input
                    type='number'
                    inputMode='numeric'
                    aria-label={`Round score for ${player.name}`}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? errorId : undefined}
                    value={round.handTotals[player.id] ?? ''}
                    onChange={scoreChangeHandler(player.id)}
                  />

                  <FieldError id={errorId} className='text-right'>
                    {error}
                  </FieldError>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
