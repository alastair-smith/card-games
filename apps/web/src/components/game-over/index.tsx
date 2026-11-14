import { CrownIcon, Share2Icon } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { CelebrationRain } from '~/components/emoji-rain/celebration-rain';
import GameLayout from '~/components/layout/game-layout';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { toast } from '~/components/ui/toast';
import type { GameType } from '~/types/game';
import { buildShareData, performShare } from '~/utils/share';

type GameOverProps = {
  gameType: GameType;
  title: ReactNode;
  isUserWinner: boolean;
  /** Rains when the user didn't win; winners get 🏆 */
  loserEmoji: string;
  shareText: string | (() => string);
  actions?: ReactNode;
  /** The leaderboard */
  children: ReactNode;
};

/** The screen shown when a game ends, around a game's own leaderboard. */
export function GameOver({
  gameType,
  title,
  isUserWinner,
  loserEmoji,
  shareText,
  actions,
  children,
}: GameOverProps) {
  const [isCelebrating, setIsCelebrating] = useState(false);

  const handleShare = async () => {
    const shareData = buildShareData({
      gameType,
      isUserWinner,
      text: typeof shareText === 'function' ? shareText() : shareText,
      host: window.location.host,
    });
    try {
      const result = await performShare(shareData);
      if (result === 'copied') toast.success('Results copied to clipboard!');
    } catch {
      toast.error('Failed to share the results. Please try again.');
    }
  };

  return (
    <CelebrationRain
      emoji={isUserWinner ? '🏆' : loserEmoji}
      isActive={isCelebrating}
      className='min-h-dvh'
    >
      <GameLayout
        actions={actions}
        gameType={gameType}
        className='flex flex-col w-full pb-2 gap-4 items-center'
      >
        <div className='flex flex-col gap-3 items-center w-full max-w-xl'>
          <Card variant='panel' className='w-full'>
            <CardContent className='pt-4 flex flex-col items-center text-center'>
              <Button
                variant='raw'
                size='fit'
                aria-label='Celebrate'
                aria-pressed={isCelebrating}
                onClick={() => setIsCelebrating((previous) => !previous)}
              >
                <CrownIcon size='100' aria-hidden='true' />
              </Button>
              <h2 className='text-2xl wrap-anywhere'>{title}</h2>
            </CardContent>
          </Card>

          <Card variant='panel' className='w-full'>
            <CardContent className='pt-4'>{children}</CardContent>
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
