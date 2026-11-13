import { UserRoundIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { MiniCard } from '~/components/ui/mini-card';
import type { EmojiReactionId, PlayerName } from '~/types/entities';
import { cn } from '~/utils/cn';
import { type PlayerColor, playerColorValue } from '~/utils/player-color';

type PlayerTagProps = {
  className?: string | undefined;
  name: PlayerName;
  color: PlayerColor;
  /** `null` keeps the card's space while the count is hidden; leave out for no card at all */
  cardCount?: number | null;
  isUser: boolean;
  isPlayersTurn: boolean;
  emojiReaction?: { emoji: string; id: EmojiReactionId } | undefined;
  children?: ReactNode;
};

/** A player's name and card count in their colour. */
export function PlayerTag({
  className,
  name,
  color,
  cardCount,
  isUser,
  isPlayersTurn,
  emojiReaction,
  children,
}: PlayerTagProps) {
  return (
    // Spans, so a tag can sit inside a button
    // Rounded here, so a group such as a ButtonGroup can square its corners
    <span className={cn('relative block rounded', className)}>
      <span
        style={{ backgroundColor: playerColorValue(color) }}
        className='relative flex h-full items-center gap-1 rounded-[inherit] border-2 border-white px-1.5 py-0.5 text-xs sm:gap-1.5 sm:px-2 sm:py-1 sm:text-sm'
      >
        {isUser && (
          <>
            <UserRoundIcon
              size='1.15em'
              strokeWidth={3}
              aria-hidden='true'
              className='shrink-0 text-white icon-outline-black'
            />
            <span className='sr-only'>You:</span>
          </>
        )}
        <span className='whitespace-nowrap font-extrabold text-white text-outline-black'>
          {name}
        </span>
        {cardCount !== undefined && (
          <MiniCard
            aria-hidden='true'
            // Still takes up space, so the tag keeps its size without a count
            className={cn(cardCount === null && 'invisible')}
          >
            {cardCount}
          </MiniCard>
        )}
        {typeof cardCount === 'number' && (
          <span className='sr-only'>, {cardCount} cards</span>
        )}

        {children}

        {emojiReaction && (
          <span
            // A new key per reaction remounts it, restarting the animation
            key={emojiReaction.id}
            aria-hidden='true'
            className='pointer-events-none absolute inset-0 z-20 flex items-center justify-center text-3xl animate-reaction-emoji'
          >
            {emojiReaction.emoji}
          </span>
        )}
      </span>

      {isPlayersTurn && (
        <span
          aria-hidden='true'
          className='pointer-events-none absolute -inset-1.5 text-white'
        >
          <span className='absolute top-0 left-0 size-2.5 rounded-tl-sm border-t-3 border-l-3 border-current' />
          <span className='absolute top-0 right-0 size-2.5 rounded-tr-sm border-t-3 border-r-3 border-current' />
          <span className='absolute bottom-0 left-0 size-2.5 rounded-bl-sm border-b-3 border-l-3 border-current' />
          <span className='absolute bottom-0 right-0 size-2.5 rounded-br-sm border-b-3 border-r-3 border-current' />
        </span>
      )}
    </span>
  );
}
