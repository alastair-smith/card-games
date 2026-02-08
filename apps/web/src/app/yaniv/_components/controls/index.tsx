import { ArrowRightCircleIcon, MegaphoneIcon } from 'lucide-react';
import { EmojiReactions } from '~/components/emoji-reactions';
import { Button } from '~/components/ui/button';
import type { ReactionEmoji } from '~/types/game';
import { cn } from '~/utils/cn';

type ControlsProps = {
  className?: string;
  onEmojiClick: (emoji: ReactionEmoji) => void;
  onEndTurnClick: () => void;
  onYanivClick: () => void;
};

export default function Controls({
  className,
  onEmojiClick,
  onEndTurnClick,
  onYanivClick,
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
      <Button onClick={onYanivClick}>
        <MegaphoneIcon /> Yaniv!
      </Button>
      <Button onClick={onEndTurnClick}>
        End Turn
        <ArrowRightCircleIcon />
      </Button>
    </div>
  );
}
