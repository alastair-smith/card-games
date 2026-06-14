import { CrownIcon, Share2Icon } from 'lucide-react';
import { useState } from 'react';
import { CelebrationRain } from '~/components/emoji-rain/celebration-rain';
import GameLayout from '~/components/layout/game-layout';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { toast } from '~/components/ui/toast';
import type { PlayerName, UserId } from '~/types/entities';
import { GameType } from '~/types/game';
import { HowToDialog } from '../how-to';
import { buildShareData, performShare } from './share';

type GameOverProps = {
  players: {
    id: UserId;
    name: PlayerName;
    score: number;
    isWinner: boolean;
  }[];
  userId: UserId;
};

export default function GameOver({ players, userId }: GameOverProps) {
  const winners = players.filter((player) => player.isWinner);
  const winningScore = winners[0]?.score;
  const userWins = winners.some((player) => player.id === userId);
  const sortedPlayers = [...players].sort((a, b) => a.score - b.score);
  const [isCelebrating, setIsCelebrating] = useState(false);

  const handleShare = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const shareData = buildShareData(players, userId, window.location.host);
    try {
      const result = await performShare(shareData);
      if (result === 'copied')
        toast.success('Game summary copied to clipboard!');
    } catch {
      toast.error('Failed to share the game summary. Please try again.');
    }
  };

  return (
    <CelebrationRain
      emoji={userWins ? '🏆' : '🗑️'}
      isActive={isCelebrating}
      className='h-dvh'
    >
      <GameLayout
        actions={<HowToDialog />}
        gameType={GameType.YANIV}
        className='flex flex-col h-dvh w-full overflow-hidden pb-2 gap-4 items-center'
      >
        <div className='flex flex-col gap-3 items-center w-fit max-w-xl'>
          <Card className='w-full'>
            <CardContent className='pt-4'>
              <div className='flex flex-col items-center'>
                <CrownIcon
                  size='100'
                  role='button'
                  className='cursor-pointer'
                  onClick={() => setIsCelebrating((previous) => !previous)}
                />
                <span className='text-2xl'>
                  {winners
                    .map(({ id, name }) => (id === userId ? 'You' : name))
                    .join(' & ') || 'Unknown Player'}{' '}
                  {!userWins && winners.length === 1 ? 'wins ' : 'win '}
                  with a score of {winningScore}!
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className='max-w-xl w-full'>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>Score</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {sortedPlayers.map(({ id, name, score }) => (
                    <TableRow key={id}>
                      <TableCell>
                        {name}
                        {id === userId && ' (You)'}
                      </TableCell>
                      <TableCell>{score}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className='flex flex-wrap gap-2 justify-end w-full'>
            <Button variant='secondary' onClick={handleShare}>
              <Share2Icon />
              Share
            </Button>
            <Button asChild>
              <a href='/'>Pick Another Game</a>
            </Button>
          </div>
        </div>
      </GameLayout>
    </CelebrationRain>
  );
}
