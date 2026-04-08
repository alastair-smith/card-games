'use client';

import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { ButtonGroup } from '~/components/ui/button-group';
import { type ReactionEmoji, reactionEmojis } from '~/types/game';
import { cn } from '~/utils/cn';

const COOLDOWN_MS = 1000;

type EmojiReactionsProps = {
  className?: string;
  onEmojiClick: (emoji: ReactionEmoji) => void;
};

export function EmojiReactions({
  className,
  onEmojiClick,
}: EmojiReactionsProps) {
  const [isOnCooldown, setIsOnCooldown] = useState(false);

  const handleClick = (emoji: ReactionEmoji) => {
    if (isOnCooldown) return;
    onEmojiClick(emoji);
    setIsOnCooldown(true);
    setTimeout(() => setIsOnCooldown(false), COOLDOWN_MS);
  };

  return (
    <ButtonGroup className={cn(className, isOnCooldown && 'opacity-50')}>
      {reactionEmojis.map((emoji) => (
        <Button
          key={emoji}
          variant='secondary'
          size='sm'
          className='text-lg bg-alt-background'
          onClick={() => handleClick(emoji)}
        >
          {emoji}
        </Button>
      ))}
    </ButtonGroup>
  );
}
