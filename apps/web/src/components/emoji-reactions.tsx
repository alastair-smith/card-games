'use client';

import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { ButtonGroup } from '~/components/ui/button-group';

const COOLDOWN_MS = 1000;

type EmojiReactionsProps<Emoji extends string> = {
  className?: string;
  emojis: readonly Emoji[];
  onEmojiClick: (emoji: Emoji) => void;
};

export function EmojiReactions<Emoji extends string>({
  className,
  emojis,
  onEmojiClick,
}: EmojiReactionsProps<Emoji>) {
  const [isOnCooldown, setIsOnCooldown] = useState(false);

  const handleClick = (emoji: Emoji) => {
    if (isOnCooldown) return;
    onEmojiClick(emoji);
    setIsOnCooldown(true);
    setTimeout(() => setIsOnCooldown(false), COOLDOWN_MS);
  };

  return (
    <ButtonGroup className={className}>
      {emojis.map((emoji) => (
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
