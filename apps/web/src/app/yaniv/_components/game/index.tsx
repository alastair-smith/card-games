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
  onEmojiClick: (emoji: string) => void;
  onEndTurnClick: () => void;
  onYanivClick: () => void;
};

export default function Game({
  onEmojiClick,
  onEndTurnClick,
  onYanivClick,
}: GameProps) {
  return (
    <GameLayout
      actions={helpContent}
      gameType={GameType.YANIV}
      className='flex flex-col h-dvh w-full overflow-hidden p-4 gap-4'
    >
      <ScoreCards className='flex-1 min-h-0' />
      <PlayArea className='h-48' />
      <Controls
        onEmojiClick={onEmojiClick}
        onEndTurnClick={onEndTurnClick}
        onYanivClick={onYanivClick}
      />
      <Hand className='h-48' />
    </GameLayout>
  );
}
