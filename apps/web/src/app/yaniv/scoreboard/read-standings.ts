import type { UserId } from '~/types/entities';
import type { Standing, Standings } from './derive-standings';
import type { RoundId } from './useYanivScoreboard';

/** The totals a score is halved at, once each per player. */
export type HalvedScore = 50 | 100;

const findRoundStandings = (
  standings: Standings,
  roundId: RoundId,
): Record<UserId, Standing> | null =>
  standings.byRound.find((round) => round.roundId === roundId)?.standings ??
  null;

/** A player's total as the game stands. */
export const getPlayerTotal = (
  standings: Standings,
  playerId: UserId,
): number => standings.totals[playerId]?.total ?? 0;

/**
 * A player's running total once a round had been played, or null for a round
 * that has not been scored — one still being entered, or played out after the
 * game had already been won.
 */
export const getPlayerRoundTotal = (
  standings: Standings,
  roundId: RoundId,
  playerId: UserId,
): number | null =>
  findRoundStandings(standings, roundId)?.[playerId]?.total ?? null;

export const hasHalvedFiftyScore = (
  standings: Standings,
  playerId: UserId,
): boolean => standings.totals[playerId]?.isFiftyScoreHalved ?? false;

export const hasHalvedHundredScore = (
  standings: Standings,
  playerId: UserId,
): boolean => standings.totals[playerId]?.isHundredScoreHalved ?? false;

/**
 * The total a player was halved at in a given round, for marking the round it
 * happened in rather than every round since.
 */
export const getRoundHalving = (
  standings: Standings,
  roundId: RoundId,
  playerId: UserId,
): HalvedScore | null => {
  const roundIndex = standings.byRound.findIndex(
    (round) => round.roundId === roundId,
  );
  if (roundIndex === -1) return null;

  const standing = standings.byRound[roundIndex]?.standings[playerId];
  if (!standing) return null;

  const previousStanding =
    roundIndex === 0
      ? null
      : standings.byRound[roundIndex - 1]?.standings[playerId];

  if (standing.isFiftyScoreHalved && !previousStanding?.isFiftyScoreHalved) {
    return 50;
  }

  if (
    standing.isHundredScoreHalved &&
    !previousStanding?.isHundredScoreHalved
  ) {
    return 100;
  }

  return null;
};

export const isPlayerWinner = (
  standings: Standings,
  playerId: UserId,
): boolean => standings.winnerIds.includes(playerId);
