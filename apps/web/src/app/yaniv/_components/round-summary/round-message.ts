import type { PlayerName, UserId } from '~/types/entities';
import type { RoundScore } from '~/types/games/yaniv';

type RoundPlayer = {
  id: UserId;
  name: PlayerName;
  roundScores: RoundScore[];
};

export const getRoundMessage = (players: RoundPlayer[], userId: UserId) => {
  const latestRoundScores = players.flatMap((player) => {
    const latestRoundScore = player.roundScores.at(-1);
    return latestRoundScore
      ? [{ player, points: latestRoundScore.adjusted }]
      : [];
  });
  const lowestPoints = Math.min(
    ...latestRoundScores.map(({ points }) => points),
  );
  const winnerNames = latestRoundScores
    .filter(({ points }) => points === lowestPoints)
    .map(({ player }) => (player.id === userId ? 'You' : player.name));

  return `${winnerNames.join(' & ')} won the round!`;
};
