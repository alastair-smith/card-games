import type { UserId } from '~/types/entities';
import type { RoundId } from '../_hooks/useYanivScoreboard';
import type { GameSummary, PlayerSummary } from './derive-game-summary';

/** The totals a score is halved at, once each per player. */
export type HalvedScore = 50 | 100;

const findRoundSummary = (
  gameSummary: GameSummary,
  roundId: RoundId,
): Record<UserId, PlayerSummary> | null =>
  gameSummary.byRound.find((round) => round.roundId === roundId)?.players ??
  null;

/** A player's total as the game stands. */
export const getPlayerTotal = (
  gameSummary: GameSummary,
  playerId: UserId,
): number => gameSummary.players[playerId]?.total ?? 0;

/**
 * A player's running total once a round had been played, or null for a round
 * that has not been scored — one still being entered, or played out after the
 * game had already been won.
 */
export const getPlayerRoundTotal = (
  gameSummary: GameSummary,
  roundId: RoundId,
  playerId: UserId,
): number | null =>
  findRoundSummary(gameSummary, roundId)?.[playerId]?.total ?? null;

export const hasHalvedFiftyScore = (
  gameSummary: GameSummary,
  playerId: UserId,
): boolean => gameSummary.players[playerId]?.isFiftyScoreHalved ?? false;

export const hasHalvedHundredScore = (
  gameSummary: GameSummary,
  playerId: UserId,
): boolean => gameSummary.players[playerId]?.isHundredScoreHalved ?? false;

/**
 * The total a player was halved at in a given round, for marking the round it
 * happened in rather than every round since.
 */
export const getRoundHalving = (
  gameSummary: GameSummary,
  roundId: RoundId,
  playerId: UserId,
): HalvedScore | null => {
  const roundIndex = gameSummary.byRound.findIndex(
    (round) => round.roundId === roundId,
  );
  if (roundIndex === -1) return null;

  const summary = gameSummary.byRound[roundIndex]?.players[playerId];
  if (!summary) return null;

  const previousSummary =
    roundIndex === 0
      ? null
      : gameSummary.byRound[roundIndex - 1]?.players[playerId];

  if (summary.isFiftyScoreHalved && !previousSummary?.isFiftyScoreHalved) {
    return 50;
  }

  if (summary.isHundredScoreHalved && !previousSummary?.isHundredScoreHalved) {
    return 100;
  }

  return null;
};

export const isPlayerWinner = (
  gameSummary: GameSummary,
  playerId: UserId,
): boolean => gameSummary.winnerIds.includes(playerId);
