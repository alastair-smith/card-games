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
import { GameType, gameURL } from '~/types/game';
import { HowToDialog } from '../how-to';

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
  const [isCelebrating, setIsCelebrating] = useState(false);

  const handleShare = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    const share = async () => {
      const shareData = {
        title: userWins
          ? 'I just won a game of Yaniv!'
          : 'I just played a game of Yaniv!',
        text: players
          .map(
            ({ name, score, isWinner }) =>
              `${score.toString().padStart(3, '0')} ${name}${isWinner ? ' 🏆' : ''}`,
          )
          .join('\n'),
        url: `https://${window.location.host}${gameURL[GameType.YANIV]}`,
      };
      if (navigator.share) {
        try {
          await navigator.share(shareData);
          return;
        } catch {
          toast.error('Failed to share the game summary. Please try again.');
        }
      } else {
        try {
          // Fallback for browsers that do not support the Web Share API
          await navigator.clipboard.writeText(
            `${shareData.title}\n\n${shareData.text}\n\nPlay at ${shareData.url}`,
          );
          toast.success('Game summary copied to clipboard!');
        } catch {
          toast.error('Failed to copy the game summary. Please try again.');
        }
      }
    };

    share();
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
                  {players.map(({ id, name, score }) => (
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
