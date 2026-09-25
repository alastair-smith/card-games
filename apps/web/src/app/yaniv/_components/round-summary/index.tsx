import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import type { PlayerName, UserId } from '~/types/entities';
import type { RoundScore } from '~/types/games/yaniv';
import { getRoundCount, Scoreboard } from '../scoreboard';
import { getRoundMessage } from './round-message';

type RoundSummaryProps = {
  players: {
    id: UserId;
    name: PlayerName;
    score: number;
    roundScores: RoundScore[];
  }[];
  userId: UserId;
};

export function RoundSummary({ players, userId }: RoundSummaryProps) {
  const roundNumber = getRoundCount(players);

  return (
    <Card variant='panel' className='w-full max-w-xl'>
      <CardHeader className='items-center text-center'>
        <CardDescription className='text-dark-text-disabled'>
          Round {roundNumber}
        </CardDescription>
        <CardTitle>{getRoundMessage(players, userId)}</CardTitle>
      </CardHeader>
      <CardContent>
        <Scoreboard players={players} userId={userId} />
      </CardContent>
    </Card>
  );
}
