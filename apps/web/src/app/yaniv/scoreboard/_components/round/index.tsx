import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Separator } from '~/components/ui/separator';
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
          {players.map((player, index) => {
            const total = getPlayerTotal(roundSummary, player.id);
            const halvingTarget = getHalvingTarget(roundSummary, player.id);
            const error = errors?.[player.id];
            const errorId = `round-${round.id}-player-${player.id}-error`;

            return (
              <li key={player.id} className='flex flex-col gap-1'>
                {index > 0 && <Separator className='mb-2' />}

                <div className='flex items-start gap-3'>
                  <span className='flex-1 pt-2 font-medium'>{player.name}</span>

                  <div className='relative w-20'>
                    <Input
                      type='number'
                      inputMode='numeric'
                      aria-label={`Round score for ${player.name}`}
                      aria-invalid={error ? true : undefined}
                      aria-describedby={error ? errorId : undefined}
                      value={round.handTotals[player.id] ?? ''}
                      onChange={scoreChangeHandler(player.id)}
                    />

                    {/* Out of the flow, so saying what is missing does not
                        shift the totals underneath it. */}
                    <FieldError
                      id={errorId}
                      className='absolute top-full right-0 mt-0.5 whitespace-nowrap'
                    >
                      {error}
                    </FieldError>
                  </div>
                </div>

                <div className='flex items-center gap-2 text-sm'>
                  <span className='font-semibold'>{total}</span>
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
                  {halvingTarget && (
                    <span>
                      {Math.abs(halvingTarget.away)}{' '}
                      {halvingTarget.away >= 0 ? 'from' : 'beyond'}{' '}
                      {halvingTarget.target}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
