import { Share2Icon, TrophyIcon } from 'lucide-react';
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
import { performShare } from '../../../_components/game-over/share';
import type { ScoreboardPlayer } from '../../_hooks/useYanivScoreboard';
import type { GameSummary } from '../../_libs/derive-game-summary';
import { getPlayerTotal, isPlayerWinner } from '../../_libs/read-game-summary';
import { buildShareData } from '../../_libs/share-game';

type GameOverProps = {
  players: ScoreboardPlayer[];
  gameSummary: GameSummary;
  onPlayAgain: () => void;
};

export default function GameOver({
  players,
  gameSummary,
  onPlayAgain,
}: GameOverProps) {
  // A lower score is the better one, so the game is won from the top down.
  const rankedPlayers = [...players]
    .map((player) => ({
      ...player,
      total: getPlayerTotal(gameSummary, player.id),
      isWinner: isPlayerWinner(gameSummary, player.id),
    }))
    .sort((player, otherPlayer) => player.total - otherPlayer.total);

  const winners = rankedPlayers.filter((player) => player.isWinner);
  const winningTotal = winners[0]?.total;

  const handleShareClick = async () => {
    try {
      const result = await performShare(
        buildShareData(rankedPlayers, window.location.host),
      );
      if (result === 'copied')
        toast.success('Game summary copied to clipboard!');
    } catch {
      toast.error('Failed to share the game summary. Please try again.');
    }
  };

  return (
    <div className='flex flex-col gap-3 items-center'>
      <Card className='w-full'>
        <CardContent className='pt-4'>
          <div className='flex flex-col items-center'>
            <TrophyIcon size='100' aria-hidden='true' />
            <span className='text-2xl'>
              {winners.map(({ name }) => name).join(' & ')}{' '}
              {winners.length === 1 ? 'wins' : 'win'} with a score of{' '}
              {winningTotal}!
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className='w-full'>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player</TableHead>
                <TableHead>Score</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rankedPlayers.map(({ id, name, total }) => (
                <TableRow key={id}>
                  <TableCell>{name}</TableCell>
                  <TableCell>{total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className='flex flex-wrap gap-2 justify-end w-full'>
        <Button variant='secondary' onClick={handleShareClick}>
          <Share2Icon />
          Share
        </Button>
        <Button onClick={onPlayAgain}>Play again</Button>
      </div>
    </div>
  );
}
