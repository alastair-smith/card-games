import { Input } from '~/components/ui/input';
import type { UserId } from '~/types/entities';
import type {
  ScoreboardPlayer,
  ScoreboardRound,
} from '../../_hooks/useYanivScoreboard';
import type { GameSummary } from '../../_libs/derive-game-summary';
import {
  getHalvingTarget,
  getPlayerRoundTotal,
  getPlayerTotal,
  hasHalvedFiftyScore,
  hasHalvedHundredScore,
} from '../../_libs/read-game-summary';
import FieldError from '../field-error';
import HalvingMarkers from '../halving-markers';

type RoundProps = {
  players: ScoreboardPlayer[];
  round: ScoreboardRound;
  gameSummary: GameSummary;
  /** What each player still needs before the round can be finished, if anything. */
  errors?: Partial<Record<UserId, string>>;
  onScoreChange: (playerId: UserId, handTotal: number | null) => void;
};

export default function Round({
  players,
  round,
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

  return (
    <div className='flex flex-col gap-4'>
      <h2 className='text-center text-xl font-semibold'>
        {round.isComplete ? 'Round scores' : 'Enter round scores'}
      </h2>

      <ul className='flex flex-col gap-3'>
        {players.map((player) => {
          // A round still being entered has no total of its own yet, so the
          // player's total going into it is shown instead.
          const total =
            getPlayerRoundTotal(gameSummary, round.id, player.id) ??
            getPlayerTotal(gameSummary, player.id);
          const halvingTarget = getHalvingTarget(gameSummary, player.id);
          const error = errors?.[player.id];
          const errorId = `round-${round.id}-player-${player.id}-error`;

          return (
            <li key={player.id} className='flex flex-col gap-1'>
              <div className='flex items-center gap-3'>
                <span className='flex-1 font-medium'>{player.name}</span>

                <Input
                  type='number'
                  inputMode='numeric'
                  className='w-20'
                  aria-label={`Round score for ${player.name}`}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? errorId : undefined}
                  value={round.handTotals[player.id] ?? ''}
                  onChange={scoreChangeHandler(player.id)}
                />
              </div>

              <div className='flex items-center gap-2 text-sm'>
                <span className='font-semibold'>{total}</span>
                <HalvingMarkers
                  isFiftyScoreHalved={hasHalvedFiftyScore(
                    gameSummary,
                    player.id,
                  )}
                  isHundredScoreHalved={hasHalvedHundredScore(
                    gameSummary,
                    player.id,
                  )}
                />
                {halvingTarget && (
                  <span className='text-light-text'>
                    {Math.abs(halvingTarget.away)}{' '}
                    {halvingTarget.away >= 0 ? 'from' : 'beyond'}{' '}
                    {halvingTarget.target}
                  </span>
                )}
              </div>

              <FieldError id={errorId}>{error}</FieldError>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
