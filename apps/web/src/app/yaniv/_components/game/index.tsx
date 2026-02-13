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
  onPlayCards: () => void;
  players: {
    id: UserId;
    cardCount: number;
    isFiftyScoreHalved: boolean;
    isHundredScoreHalved: boolean;
    name: PlayerName;
    score: number;
  }[];
  playerTakingTurn?: PlayerName;
  stage: 'waiting-for-player' | 'picking-cards' | 'end-turn';
  userId: UserId;
  playedCards: PlayingCardValue[];
  discardCard: PlayingCardValue | null;
};

export default function Game({
  onEmojiClick,
  onEndTurnClick,
  onYanivClick,
  onPlayCards,
  players,
  playerTakingTurn,
  stage,
  cards,
  userId,
  playedCards,
  discardCard,
}: GameProps) {
  const userPlayer = useMemo(() => {
    return players.find((player) => player.id === userId);
  }, [players, userId]);

  return (
    <GameLayout
      actions={helpContent}
      gameType={GameType.YANIV}
      className='flex flex-col h-dvh w-full overflow-hidden pb-2 gap-4'
    >
      <ScoreCards className='' players={players} />
      <PlayArea
        playedCards={playedCards}
        discardCard={discardCard}
        className='md:text-2xl sm:text-lg flex-1'
      />
      <Controls
        onEmojiClick={onEmojiClick}
        onEndTurnClick={onEndTurnClick}
        onYanivClick={onYanivClick}
        onPlayCards={onPlayCards}
        playerTakingTurn={playerTakingTurn}
        stage={stage}
      />
      <Hand
        cards={cards}
        isFiftyScoreHalved={!!userPlayer?.isFiftyScoreHalved}
        isHundredScoreHalved={!!userPlayer?.isHundredScoreHalved}
        totalScore={userPlayer?.score ?? 0}
        className='md:text-2xl sm:text-lg'
      />
    </GameLayout>
  );
}
