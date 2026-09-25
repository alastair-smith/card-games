import {
  ArrowDownCircleIcon,
  ArrowRightCircleIcon,
  ArrowUpCircleIcon,
  BrainIcon,
  CircleCheckIcon,
  CogIcon,
  MegaphoneIcon,
} from 'lucide-react';
import { EmojiReactions } from '~/components/emoji-reactions';
import { Button } from '~/components/ui/button';
import type { PlayerName } from '~/types/entities';
import type { ReactionEmoji } from '~/types/game';
import { GameViewStage } from '~/types/games/yaniv';
import { cn } from '~/utils/cn';

type ControlsProps = {
  className?: string;
  onEmojiClick: (emoji: ReactionEmoji) => void;
  onEndTurnClick: () => void;
  onYanivClick: () => void;
  onPlayCards: (direction?: 'ascending' | 'descending') => void;
  isRunSelected?: boolean;
  playerTakingTurn?: PlayerName;
  stage: GameViewStage;
};

export default function Controls({
  className,
  onEmojiClick,
  onEndTurnClick,
  onYanivClick,
  onPlayCards,
  isRunSelected,
  playerTakingTurn,
  stage,
}: ControlsProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 grid-rows-[auto_--spacing(10)] md:grid-cols-4 md:grid-rows-[--spacing(10)] gap-2 items-center px-2',
        className,
      )}
    >
      <EmojiReactions
        onEmojiClick={onEmojiClick}
        className='flex-1 justify-self-center md:justify-self-auto col-span-2'
      />

      {stage === GameViewStage.WAITING_FOR_PLAYER && (
        <div className='flex gap-2 justify-center col-span-2'>
          <span className='text-balance'>{playerTakingTurn} is thinking</span>
          <div className='flex'>
            <CogIcon className='animate-spin' />
            <BrainIcon className='animate-pulse' />
            <CogIcon className='animate-spin' />
          </div>
        </div>
      )}

      {stage === GameViewStage.PICKING_CARDS &&
        (isRunSelected ? (
          <>
            <Button onClick={() => onPlayCards('ascending')}>
              <ArrowUpCircleIcon />
              Play ascending
            </Button>
            <Button onClick={() => onPlayCards('descending')}>
              <ArrowDownCircleIcon />
              Play descending
            </Button>
          </>
        ) : (
          <Button onClick={() => onPlayCards()} className='-col-end-1'>
            <CircleCheckIcon />
            Play Cards
          </Button>
        ))}

      {stage === GameViewStage.END_TURN && (
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

      {stage === GameViewStage.END_OF_ROUND && (
        <Button
          onClick={() => onPlayCards()}
          className='col-span-2 md:col-span-1 md:col-start-4'
        >
          Start new round
          <ArrowRightCircleIcon />
        </Button>
      )}

      {stage === GameViewStage.WAITING_FOR_NEW_ROUND && (
        <div className='flex gap-2 justify-center col-span-2'>
          <span className='text-balance'>
            Waiting for {playerTakingTurn} to deal
          </span>
          <div className='flex'>
            <CogIcon className='animate-spin' />
            <BrainIcon className='animate-pulse' />
            <CogIcon className='animate-spin' />
          </div>
        </div>
      )}
    </div>
  );
}
