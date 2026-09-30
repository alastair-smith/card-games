import type { PlayerName, UserId } from '~/types/entities';
import type { RoundScore } from '~/types/games/yaniv';

export type ScoreboardPlayer = {
  id: UserId;
  name: PlayerName;
  score: number;
  roundScores: RoundScore[];
};

export type ScoreboardRow = ScoreboardPlayer & { isUser: boolean };

export const getRoundCount = (
  players: Pick<ScoreboardPlayer, 'roundScores'>[],
) => Math.max(0, ...players.map((player) => player.roundScores.length));

export const toScoreboardRows = (
  players: ScoreboardPlayer[],
  userId: UserId,
): ScoreboardRow[] =>
  [...players]
    .sort((first, second) => first.score - second.score)
    .map(({ id, name, score, roundScores }) => ({
      id,
      name,
      score,
      roundScores,
      isUser: id === userId,
    }));
