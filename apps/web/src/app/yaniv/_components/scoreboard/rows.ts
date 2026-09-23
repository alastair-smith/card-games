import type { PlayerName, UserId } from '~/types/entities';
import type { RoundScore } from '~/types/games/yaniv';

export type RoundChange = {
  adjusted: number;
  halvedBy: number;
};

export type ScoreboardPlayer = {
  id: UserId;
  name: PlayerName;
  score: number;
  roundScores: RoundScore[];
};

export type ScoreboardRow = {
  id: UserId;
  name: PlayerName;
  score: number;
  isUser: boolean;
  roundChanges: RoundChange[];
};

const toRoundChanges = (roundScores: RoundScore[]): RoundChange[] => {
  let runningTotal = 0;
  return roundScores.map(({ adjusted, isScoreHalved }) => {
    runningTotal += adjusted;
    const halvedBy = isScoreHalved ? runningTotal / 2 : 0;
    runningTotal -= halvedBy;
    return { adjusted, halvedBy };
  });
};

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
      isUser: id === userId,
      roundChanges: toRoundChanges(roundScores),
    }));
