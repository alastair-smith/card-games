import type { UserId } from '~/types/entities';
import { GAME_OVER_SCORE } from '~/types/games/yaniv';
import type {
  RoundId,
  ScoreboardPlayer,
  ScoreboardRound,
  ScoreboardState,
} from '../_hooks/useYanivScoreboard';

export type PlayerSummary = {
  total: number;
  isFiftyScoreHalved: boolean;
  isHundredScoreHalved: boolean;
};

export type RoundSummary = {
  roundId: RoundId;
  players: Record<UserId, PlayerSummary>;
};

export type GameSummary = {
  /** Where every player stood after each completed round, for the table. */
  byRound: RoundSummary[];
  players: Record<UserId, PlayerSummary>;
  isGameOver: boolean;
  winnerIds: UserId[];
};

const newPlayerSummary = (): PlayerSummary => ({
  total: 0,
  isFiftyScoreHalved: false,
  isHundredScoreHalved: false,
});

const applyScoreHalving = (
  newTotal: number,
  summary: PlayerSummary,
): PlayerSummary => {
  if (newTotal === 50 && !summary.isFiftyScoreHalved) {
    return { ...summary, total: 25, isFiftyScoreHalved: true };
  }

  if (newTotal === 100 && !summary.isHundredScoreHalved) {
    return { ...summary, total: 50, isHundredScoreHalved: true };
  }

  return { ...summary, total: newTotal };
};

const scoreRound = (
  playerSummaries: Record<UserId, PlayerSummary>,
  round: ScoreboardRound,
  players: ScoreboardPlayer[],
): Record<UserId, PlayerSummary> =>
  Object.fromEntries(
    players.map((player) => {
      const summary = playerSummaries[player.id] ?? newPlayerSummary();
      const roundScore = round.handTotals[player.id] ?? 0;

      return [
        player.id,
        applyScoreHalving(summary.total + roundScore, summary),
      ];
    }),
  );

/**
 * Where the players would stand if the round being entered were finished now,
 * so a total keeps up with the scores as they are typed without the round
 * counting towards the game until it is finished.
 */
export const previewRound = (
  gameSummary: GameSummary,
  round: ScoreboardRound,
  players: ScoreboardPlayer[],
): Record<UserId, PlayerSummary> =>
  scoreRound(gameSummary.players, round, players);

/**
 * Every total, halving and knockout in the game is worked out from the round
 * scores alone, so correcting a score from an earlier round replays the rest of
 * the game around it rather than leaving stale totals behind.
 */
export const deriveGameSummary = ({
  players,
  rounds,
}: ScoreboardState): GameSummary => {
  let playerSummaries: Record<UserId, PlayerSummary> = Object.fromEntries(
    players.map((player) => [player.id, newPlayerSummary()]),
  );

  const byRound: RoundSummary[] = [];
  let isGameOver = false;

  for (const round of rounds) {
    // The round still being entered is not scored until the players finish it.
    if (!round.isComplete) break;

    playerSummaries = scoreRound(playerSummaries, round, players);

    byRound.push({ roundId: round.id, players: playerSummaries });

    isGameOver = Object.values(playerSummaries).some(
      (summary) => summary.total > GAME_OVER_SCORE,
    );

    // Anything played after the game was won no longer counts.
    if (isGameOver) break;
  }

  const lowestTotal = Math.min(
    ...Object.values(playerSummaries).map((summary) => summary.total),
  );

  return {
    byRound,
    players: playerSummaries,
    isGameOver,
    winnerIds: isGameOver
      ? players
          .filter((player) => playerSummaries[player.id]?.total === lowestTotal)
          .map((player) => player.id)
      : [],
  };
};
