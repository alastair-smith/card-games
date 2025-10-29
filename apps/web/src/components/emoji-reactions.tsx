'use client';

import { Button } from '~/components/ui/button';
import { ButtonGroup } from '~/components/ui/button-group';
import { type ReactionEmoji, reactionEmojis } from '~/types/game';

type EmojiReactionsProps = {
  className?: string;
  onEmojiClick: (emoji: ReactionEmoji) => void;
};

export function EmojiReactions({
  className,
  onEmojiClick,
}: EmojiReactionsProps) {
  return (
    <ButtonGroup className={className}>
      {reactionEmojis.map((emoji) => (
        <Button
          key={emoji}
          variant='secondary'
          size='sm'
          className='text-lg bg-switch'
          onClick={() => onEmojiClick(emoji)}
        >
          {emoji}
        </Button>
      ))}
    </ButtonGroup>
  );
}
