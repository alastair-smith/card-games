import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import type { PlayerName, UserId } from '~/types/entities';
import type { RoundScore } from '~/types/games/yaniv';
import { cn } from '~/utils/cn';
import { getRoundCount, Scoreboard } from '../scoreboard';
import { getRoundMessage } from './round-message';

type RoundSummaryProps = {
  className?: string;
  players: {
    id: UserId;
    name: PlayerName;
    score: number;
    roundScores: RoundScore[];
  }[];
  userId: UserId;
  /** Mid-round, it shows the scores so far instead of the round's result. */
  isRoundOver: boolean;
};

export function RoundSummary({
  className,
  players,
  userId,
  isRoundOver,
}: RoundSummaryProps) {
  const roundNumber = getRoundCount(players);
  const scoresDescription =
    roundNumber === 0 ? 'No rounds played yet' : `After round ${roundNumber}`;

  return (
    <Card variant='panel' className={cn('w-full max-w-xl', className)}>
      <CardHeader className='items-center space-y-1 pb-2 text-center'>
        <CardDescription>
          {isRoundOver ? `Round ${roundNumber}` : scoresDescription}
        </CardDescription>
        <CardTitle className='text-xl'>
          {isRoundOver ? getRoundMessage(players, userId) : 'Scores'}
        </CardTitle>
      </CardHeader>
      {/* Narrower sides than the header, so a max-length name fits beside
          its points on smaller screens */}
      <CardContent className='px-3'>
        <Scoreboard players={players} userId={userId} />
      </CardContent>
    </Card>
  );
}
