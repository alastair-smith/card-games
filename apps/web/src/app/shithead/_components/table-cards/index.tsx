import {
  PLAYING_CARD_PROPORTIONS,
  PlayingCard,
} from '~/components/ui/playing-card';
import type { StandardPlayingCard } from '~/types/cards';
import { cardAriaLabel } from '~/utils/cards';
import { cn } from '~/utils/cn';

export type TableCardSlot = {
  faceUpCard: StandardPlayingCard | null;
  hasFaceDownCard: boolean;
};

type TableCardsProps = {
  className?: string | undefined;
  slots: TableCardSlot[];
};

function describeTableCards(slots: TableCardSlot[]) {
  const faceUpLabels = slots.flatMap((slot) =>
    slot.faceUpCard ? [cardAriaLabel(slot.faceUpCard)] : [],
  );
  const faceDownCount = slots.filter((slot) => slot.hasFaceDownCard).length;

  if (faceUpLabels.length === 0 && faceDownCount === 0) return null;

  const faceUpDescription =
    faceUpLabels.length > 0
      ? `Face up: ${faceUpLabels.join(', ')}.`
      : 'No face-up cards.';
  return `${faceUpDescription} ${faceDownCount} face down.`;
}

/** A player's face-down cards, each with its face-up card on top. */
export function TableCards({ className, slots }: TableCardsProps) {
  const description = describeTableCards(slots);

  return (
    <div className={cn('text-xs sm:text-base', className)}>
      <div aria-hidden='true' className='flex gap-0.5 sm:gap-1'>
        {slots.map((slot, slotIndex) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: slots keep their position on the table
          <div key={slotIndex} className='relative pb-[0.5em]'>
            {slot.hasFaceDownCard ? (
              <PlayingCard card={null} border />
            ) : (
              <div className={PLAYING_CARD_PROPORTIONS} />
            )}
            {slot.faceUpCard && (
              <PlayingCard
                card={slot.faceUpCard}
                border
                className='absolute top-[0.5em] left-0'
              />
            )}
          </div>
        ))}
      </div>
      {description && <span className='sr-only'>{description}</span>}
    </div>
  );
}
