import { CrownIcon, Share2Icon } from 'lucide-react';
import GameLayout from '~/components/layout/game-layout';
import { PlayerTag } from '~/components/player-tag';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { toast } from '~/components/ui/toast';
import type { ClientFinishedPlayer } from '~/server/state/game/shithead/lib/to-client-game-state';
import { GameType } from '~/types/game';
import { performShare } from '~/utils/share';
import { FINISHING_POSITIONS } from '~/utils/shithead/finishing-positions';
import { buildShareData } from './share';

type GameOverPlayer = Pick<
  ClientFinishedPlayer,
  'id' | 'name' | 'color' | 'isUser' | 'finishingPosition'
>;

type GameOverProps = {
  players: GameOverPlayer[];
};

export default function GameOver({ players }: GameOverProps) {
  const finishingOrder = [...players].sort(
    (first, second) => first.finishingPosition - second.finishingPosition,
  );
  const winner = finishingOrder[0];

  const handleShare = async () => {
    const shareData = buildShareData(finishingOrder, window.location.host);
    try {
      const result = await performShare(shareData);
      if (result === 'copied') toast.success('Results copied to clipboard!');
    } catch {
      toast.error('Failed to share the results. Please try again.');
    }
  };

  return (
    <GameLayout
      gameType={GameType.SHITHEAD}
      className='flex flex-col w-full pb-2 gap-4 items-center'
    >
      <div className='flex flex-col gap-3 items-center w-full max-w-xl'>
        <Card variant='panel' className='w-full'>
          <CardContent className='pt-4 flex flex-col items-center text-center'>
            <CrownIcon size='100' aria-hidden='true' />
            {winner && (
              <h2 className='text-2xl wrap-anywhere'>
                {winner.isUser ? 'You win!' : `${winner.name} wins!`}
              </h2>
            )}
          </CardContent>
        </Card>

        <Card variant='panel' className='w-full'>
          <CardContent className='pt-4 flex flex-col gap-3'>
            <h3 className='font-bold'>Finishing order</h3>
            <ol className='flex flex-col gap-2'>
              {finishingOrder.map((player) => (
                <FinishingOrderRow key={player.id} player={player} />
              ))}
            </ol>
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
  );
}

function FinishingOrderRow({ player }: { player: GameOverPlayer }) {
  const { label, medal } = FINISHING_POSITIONS[player.finishingPosition];

  return (
    <li className='flex items-center gap-2'>
      <span className='w-8 shrink-0 font-black'>{label}</span>
      <span aria-hidden='true' className='w-7 shrink-0 text-xl'>
        {medal}
      </span>
      <PlayerTag
        name={player.name}
        color={player.color}
        isUser={player.isUser}
        isPlayersTurn={false}
      />
    </li>
  );
}
