import { GameOver as GameOverScreen } from '~/components/game-over';
import type { PlayerName, UserId } from '~/types/entities';
import { GameType } from '~/types/game';
import type { RoundScore } from '~/types/games/yaniv';
import { HowToDialog } from '../how-to';
import { Scoreboard } from '../scoreboard';
import { buildShareText } from './share';

type GameOverProps = {
  players: {
    id: UserId;
    name: PlayerName;
    score: number;
    roundScores: RoundScore[];
    isWinner: boolean;
  }[];
  userId: UserId;
};

export default function GameOver({ players, userId }: GameOverProps) {
  const winners = players.filter((player) => player.isWinner);
  const winningScore = winners[0]?.score;
  const userWins = winners.some((player) => player.id === userId);

  return (
    <GameOverScreen
      gameType={GameType.YANIV}
      title={
        <>
          {winners
            .map(({ id, name }) => (id === userId ? 'You' : name))
            .join(' & ') || 'Unknown Player'}{' '}
          {!userWins && winners.length === 1 ? 'wins ' : 'win '}
          with a score of {winningScore}!
        </>
      }
      isUserWinner={userWins}
      loserEmoji='🗑️'
      shareText={() => buildShareText(players)}
      actions={<HowToDialog />}
    >
      <Scoreboard players={players} userId={userId} isInitiallyExpanded />
    </GameOverScreen>
  );
}
