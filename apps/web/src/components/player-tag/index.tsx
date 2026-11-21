import { CrownIcon, type LucideIcon, UserRoundIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { MiniCard } from '~/components/ui/mini-card';
import type { EmojiReactionId } from '~/types/entities';
import { cn } from '~/utils/cn';
import { type PlayerColor, playerColorValue } from '~/utils/player-color';

type PlayerTagProps = {
  className?: string | undefined;
  color: PlayerColor;
  isPlayersTurn: boolean;
  children: ReactNode;
};

/** A player's tag in their colour, holding the parts the caller places. */
export function PlayerTag({
  className,
  color,
  isPlayersTurn,
  children,
}: PlayerTagProps) {
  return (
    // Spans, so a tag can sit inside a button
    // Rounded here, so a group such as a ButtonGroup can square its corners
    <span className={cn('relative block w-fit rounded', className)}>
      <span
        style={{ backgroundColor: playerColorValue(color) }}
        className='relative flex h-full items-center justify-center gap-1 rounded-[inherit] border-2 border-white px-1.5 py-0.5 text-xs sm:gap-1.5 sm:px-2 sm:py-1 sm:text-sm'
      >
        {children}
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

function PlayerTagIcon({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <>
      <Icon
        size='1.15em'
        strokeWidth={3}
        aria-hidden='true'
        className='shrink-0 text-white icon-outline-black'
      />
      <span className='sr-only'>{label}</span>
    </>
  );
}

export function PlayerTagHostIcon() {
  return <PlayerTagIcon icon={CrownIcon} label='Host:' />;
}

export function PlayerTagUserIcon() {
  return <PlayerTagIcon icon={UserRoundIcon} label='You:' />;
}

/** Holds the name and card count, so a long name wraps what follows it. */
export function PlayerTagLabel({ children }: { children: ReactNode }) {
  return (
    <span
      // As wide as the longest name in the widest letter, so on smaller
      // screens a long name wraps the card count below it
      className='flex max-w-[8.75rem] flex-wrap items-center justify-center gap-1 sm:max-w-none sm:gap-1.5'
    >
      {children}
    </span>
  );
}

export function PlayerTagName({ children }: { children: ReactNode }) {
  return (
    <span className='whitespace-nowrap font-extrabold text-white text-outline-black'>
      {children}
    </span>
  );
}

/** `null` keeps the card's space while the count is hidden. */
export function PlayerTagCardCount({ count }: { count: number | null }) {
  return (
    <>
      <MiniCard
        aria-hidden='true'
        // Still takes up space, so the tag keeps its size without a count
        className={cn(count === null && 'invisible')}
      >
        {count}
      </MiniCard>
      {count !== null && <span className='sr-only'>, {count} cards</span>}
    </>
  );
}

export function PlayerTagReaction({
  reaction,
}: {
  reaction: { emoji: string; id: EmojiReactionId } | undefined;
}) {
  if (!reaction) {
    return null;
  }

  return (
    <span
      // A new key per reaction remounts it, restarting the animation
      key={reaction.id}
      aria-hidden='true'
      className='pointer-events-none absolute inset-0 z-20 flex items-center justify-center text-3xl animate-reaction-emoji'
    >
      {reaction.emoji}
    </span>
  );
}
