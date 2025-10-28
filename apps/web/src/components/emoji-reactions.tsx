'use client';

import { Button } from '~/components/ui/button';
import { ButtonGroup } from '~/components/ui/button-group';
import { reactionEmojis } from '~/types/game';

type EmojiReactionsProps = {
  className?: string;
};

export function EmojiReactions({ className }: EmojiReactionsProps) {
  return (
    <ButtonGroup className={className}>
      {reactionEmojis.map((emoji) => (
        <Button key={emoji} variant='secondary' size='sm' className='text-lg'>
          {emoji}
        </Button>
      ))}
    </ButtonGroup>
  );
}
