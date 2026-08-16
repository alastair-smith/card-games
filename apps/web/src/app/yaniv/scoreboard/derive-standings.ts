import type { UserId } from '~/types/entities';
import { GAME_OVER_SCORE } from '~/types/games/yaniv';
import type { RoundId, ScoreboardState } from './useYanivScoreboard';

export type Standing = {
  total: number;
  isFiftyScoreHalved: boolean;
  isHundredScoreHalved: boolean;
};

export type RoundStanding = {
  roundId: RoundId;
  standings: Record<UserId, Standing>;
};

export type Standings = {
  /** Running standings after each completed round, for the scoreboard table. */
  byRound: RoundStanding[];
  totals: Record<UserId, Standing>;
  isGameOver: boolean;
  winnerIds: UserId[];
};

const newStanding = (): Standing => ({
  total: 0,
  isFiftyScoreHalved: false,
  isHundredScoreHalved: false,
});

const applyScoreHalving = (newTotal: number, standing: Standing): Standing => {
  if (newTotal === 50 && !standing.isFiftyScoreHalved) {
    return { ...standing, total: 25, isFiftyScoreHalved: true };
  }

  if (newTotal === 100 && !standing.isHundredScoreHalved) {
    return { ...standing, total: 50, isHundredScoreHalved: true };
  }

  return { ...standing, total: newTotal };
};

/**
 * Every total, halving and knockout in the game is worked out from the round
 * scores alone, so correcting a score from an earlier round replays the rest of
 * the game around it rather than leaving stale totals behind.
 */
export const deriveStandings = ({
  players,
  rounds,
}: ScoreboardState): Standings => {
  let standings: Record<UserId, Standing> = Object.fromEntries(
    players.map((player) => [player.id, newStanding()]),
  );

  const byRound: RoundStanding[] = [];
  let isGameOver = false;

  for (const round of rounds) {
    // The round still being entered is not scored until the players finish it.
    if (!round.isComplete) break;

    standings = Object.fromEntries(
      players.map((player) => {
        const standing = standings[player.id] ?? newStanding();
        const roundScore = round.handTotals[player.id] ?? 0;

        return [
          player.id,
          applyScoreHalving(standing.total + roundScore, standing),
        ];
      }),
    );

    byRound.push({ roundId: round.id, standings });

    isGameOver = Object.values(standings).some(
      (standing) => standing.total > GAME_OVER_SCORE,
    );

    // Anything played after the game was won no longer counts.
    if (isGameOver) break;
  }

  const lowestTotal = Math.min(
    ...Object.values(standings).map((standing) => standing.total),
  );

  return {
    byRound,
    totals: standings,
    isGameOver,
    winnerIds: isGameOver
      ? players
          .filter((player) => standings[player.id]?.total === lowestTotal)
          .map((player) => player.id)
      : [],
  };
};
