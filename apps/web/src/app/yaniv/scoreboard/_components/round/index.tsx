import { Fragment } from 'react';
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
import HalvingMarkers from '../halving-markers';

type RoundProps = {
  players: ScoreboardPlayer[];
  round: ScoreboardRound;
  gameSummary: GameSummary;
  onScoreChange: (playerId: UserId, handTotal: number) => void;
};

export default function Round({
  players,
  round,
  gameSummary,
  onScoreChange,
}: RoundProps) {
  const scoreChangeHandler =
    (playerId: UserId) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const handTotal = Number(event.target.value);

      // An emptied box is left alone rather than counted as a zero.
      if (event.target.value === '' || Number.isNaN(handTotal)) return;

      onScoreChange(playerId, handTotal);
    };

  return (
    <dl>
      {players.map((player) => {
        // A round still being entered has no total of its own yet, so the
        // player's total going into it is shown instead.
        const total =
          getPlayerRoundTotal(gameSummary, round.id, player.id) ??
          getPlayerTotal(gameSummary, player.id);
        const halvingTarget = getHalvingTarget(gameSummary, player.id);

        return (
          <Fragment key={player.id}>
            <dt>{player.name}</dt>
            <dd>
              <Input
                type='number'
                inputMode='numeric'
                aria-label={`Round score for ${player.name}`}
                value={round.handTotals[player.id] ?? ''}
                onChange={scoreChangeHandler(player.id)}
              />
            </dd>
            <dd className='flex items-center gap-2'>
              ({total})
              <HalvingMarkers
                isFiftyScoreHalved={hasHalvedFiftyScore(gameSummary, player.id)}
                isHundredScoreHalved={hasHalvedHundredScore(
                  gameSummary,
                  player.id,
                )}
              />
            </dd>
            <dd>
              {halvingTarget
                ? `${Math.abs(halvingTarget.away)} ${
                    halvingTarget.away >= 0 ? 'from' : 'beyond'
                  } ${halvingTarget.target}`
                : null}
            </dd>
          </Fragment>
        );
      })}
    </dl>
  );
}
