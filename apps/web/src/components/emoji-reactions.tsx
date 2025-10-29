'use client';

import { Button } from '~/components/ui/button';
import { ButtonGroup } from '~/components/ui/button-group';
import type { UserId } from '~/types/entities';
import { type ReactionEmoji, reactionEmojis } from '~/types/game';

type EmojiReactionsProps = {
  className?: string;
  onEmojiClick: (emoji: ReactionEmoji, targetPlayerId: UserId) => void;
  targetPlayerId: UserId;
};

export function EmojiReactions({
  className,
  onEmojiClick,
  targetPlayerId,
}: EmojiReactionsProps) {
  return (
    <ButtonGroup className={className}>
      {reactionEmojis.map((emoji) => (
        <Button
          key={emoji}
          variant='secondary'
          size='sm'
          className='text-lg bg-switch'
          onClick={() => onEmojiClick(emoji, targetPlayerId)}
        >
          {emoji}
        </Button>
      ))}
    </ButtonGroup>
  );
}
