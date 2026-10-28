import { UserRoundIcon } from 'lucide-react';
import type { EmojiReactionId, PlayerName } from '~/types/entities';
import { cn } from '~/utils/cn';
import { type PlayerColor, playerColorValue } from '~/utils/player-color';

type PlayerTagProps = {
  className?: string;
  name: PlayerName;
  color: PlayerColor;
  cardCount: number;
  isUser: boolean;
  isPlayersTurn: boolean;
  isYanivCalled: boolean;
  emojiReaction?: { emoji: string; id: EmojiReactionId } | undefined;
};

/** A player's name and card count in their colour. */
export function PlayerTag({
  className,
  name,
  color,
  cardCount,
  isUser,
  isPlayersTurn,
  isYanivCalled,
  emojiReaction,
}: PlayerTagProps) {
  return (
    <div className={cn('relative', className)}>
      <div
        style={{ backgroundColor: playerColorValue(color) }}
        className='relative flex items-center gap-1 rounded border-2 border-white px-1.5 py-0.5 text-xs sm:gap-1.5 sm:px-2 sm:py-1 sm:text-sm'
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
        <span
          aria-hidden='true'
          className='grid h-[1.9em] w-[1.4em] place-items-center rounded-[3px] border border-black/40 bg-true-white font-bold text-slate'
        >
          {cardCount}
        </span>
        <span className='sr-only'>, {cardCount} cards</span>

        {isYanivCalled && (
          <>
            <span
              aria-hidden='true'
              // Above the turn brackets of the tag next to it
              className='absolute -top-3 -right-4 z-10 rotate-12 rounded-sm border-2 border-black bg-true-white px-1 text-xs font-black uppercase text-slate'
            >
              Yaniv!
            </span>
            <span className='sr-only'>, has called Yaniv</span>
          </>
        )}

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
      </div>

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
    </div>
  );
}
