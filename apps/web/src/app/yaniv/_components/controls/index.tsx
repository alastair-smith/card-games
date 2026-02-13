import {
  ArrowRightCircleIcon,
  BrainIcon,
  CircleCheckIcon,
  CogIcon,
  MegaphoneIcon,
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
  onPlayCards: () => void;
  playerTakingTurn?: PlayerName;
  stage: 'waiting-for-player' | 'picking-cards' | 'end-turn';
};

export default function Controls({
  className,
  onEmojiClick,
  onEndTurnClick,
  onYanivClick,
  onPlayCards,
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
        <div className='flex gap-2 justify-center col-span-2'>
          <span className='text-balance'>{playerTakingTurn} is thinking</span>
          <div className='flex'>
            <CogIcon className='animate-spin' />
            <BrainIcon className='animate-pulse' />
            <CogIcon className='animate-spin' />
          </div>
        </div>
      )}

      {stage === 'picking-cards' && (
        <Button onClick={onPlayCards} className='col-end-[-1]'>
          <CircleCheckIcon />
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
