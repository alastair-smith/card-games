import {
  ArrowRightCircleIcon,
  DrumIcon,
  MegaphoneIcon,
  PlayIcon,
} from 'lucide-react';
import { EmojiReactions } from '~/components/emoji-reactions';
import { Button } from '~/components/ui/button';
import type { PlayerName } from '~/types/entities';
import type { ReactionEmoji } from '~/types/game';
import { cn } from '~/utils/cn';

type ControlsProps = {
  className?: string;
  onEmojiClick: (emoji: ReactionEmoji) => void;
  onEndTurnClick: () => void;
  onYanivClick: () => void;
  playCards: () => void;
  playerTakingTurn?: PlayerName;
  stage: 'waiting-for-player' | 'picking-cards' | 'end-turn';
};

export default function Controls({
  className,
  onEmojiClick,
  onEndTurnClick,
  onYanivClick,
  playCards,
  playerTakingTurn,
  stage,
}: ControlsProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 md:grid-cols-4 gap-2 items-center',
        className,
      )}
    >
      <EmojiReactions
        onEmojiClick={onEmojiClick}
        className='flex-1 justify-self-center md:justify-self-auto col-span-2'
      />

      {stage === 'waiting-for-player' && (
        <div className='flex gap-2 justify-center animate-bounce'>
          <span>Waiting for {playerTakingTurn}...</span>
          <DrumIcon />
        </div>
      )}

      {stage === 'picking-cards' && (
        <Button onClick={playCards} className='col-span-2'>
          Play Cards
        </Button>
      )}

      {stage === 'end-turn' && (
        <>
          <Button onClick={onYanivClick}>
            <MegaphoneIcon /> Yaniv!
          </Button>
          <Button onClick={onEndTurnClick}>
            End Turn
            <ArrowRightCircleIcon />
          </Button>
        </>
      )}
    </div>
  );
}
