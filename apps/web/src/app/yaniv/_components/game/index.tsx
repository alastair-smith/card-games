import { useMemo } from 'react';
import GameLayout from '~/components/layout/game-layout';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import type { PlayingCardValue } from '~/types/cards';
import type { PlayerName, UserId } from '~/types/entities';
import { GameType } from '~/types/game';
import Controls from '../controls';
import Hand from '../hand';
import PlayArea from '../play-area';
import ScoreCards from '../scorecards';

const helpContent = (
  <div className='flex gap-2'>
    <Dialog>
      <DialogTrigger asChild>
        <Button size='sm' variant='secondary'>
          Help
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>How to play Yaniv</DialogTitle>
          <DialogDescription asChild>
            {/*<HowToContent />*/}
            TODO
          </DialogDescription>
          <DialogFooter>
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  </div>
);

type GameProps = {
  cards: PlayingCardValue[];
  onEmojiClick: (emoji: string) => void;
  onEndTurnClick: () => void;
  onYanivClick: () => void;
  players: {
    id: UserId;
    cardCount: number;
    isFiftyScoreHalved: boolean;
    isHundredScoreHalved: boolean;
    name: PlayerName;
    score: number;
  }[];
  userId: UserId;
};

export default function Game({
  onEmojiClick,
  onEndTurnClick,
  onYanivClick,
  players,
  cards,
  userId,
}: GameProps) {
  const userPlayer = useMemo(() => {
    return players.find((player) => player.id === userId);
  }, [players, userId]);

  return (
    <GameLayout
      actions={helpContent}
      gameType={GameType.YANIV}
      className='flex flex-col h-dvh w-full overflow-hidden p-4 gap-4'
    >
      <ScoreCards className='' players={players} />
      <PlayArea className='flex-1 min-h-48' />
      <Controls
        onEmojiClick={onEmojiClick}
        onEndTurnClick={onEndTurnClick}
        onYanivClick={onYanivClick}
      />
      <Hand
        cards={cards}
        isFiftyScoreHalved={!!userPlayer?.isFiftyScoreHalved}
        isHundredScoreHalved={!!userPlayer?.isHundredScoreHalved}
        totalScore={userPlayer?.score ?? 0}
      />
    </GameLayout>
  );
}
