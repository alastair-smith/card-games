import { PLAYING_CARD_PROPORTIONS } from '~/components/ui/playing-card';
import type { StandardPlayingCard } from '~/types/cards';
import type { TableCardSlot } from '~/types/games/shithead';
import { cardAriaLabel } from '~/utils/cards';
import { cn } from '~/utils/cn';
import { ShitheadPlayingCard } from '../shithead-playing-card';

type TableCardsProps = {
  className?: string | undefined;
  slots: TableCardSlot[];
  selectableSlotIndexes?: number[] | undefined;
  selectedSlotIndexes?: number[] | undefined;
  /** Makes the top card of each selectable slot a button */
  onSlotClick?: ((slotIndex: number) => void) | undefined;
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
export function TableCards({
  className,
  slots,
  selectableSlotIndexes = [],
  selectedSlotIndexes = [],
  onSlotClick,
}: TableCardsProps) {
  const description = describeTableCards(slots);

  return (
    <div className={cn('text-xs sm:text-base', className)}>
      <div className='flex gap-0.5 sm:gap-1'>
        {slots.map((slot, slotIndex) => {
          const topCard = {
            isSelectable:
              onSlotClick !== undefined &&
              selectableSlotIndexes.includes(slotIndex),
            isSelected: selectedSlotIndexes.includes(slotIndex),
            onClick: () => onSlotClick?.(slotIndex),
          };

          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: slots keep their position on the table
            <div key={slotIndex} className='relative pb-[0.5em]'>
              {slot.hasFaceDownCard ? (
                <TableCard
                  card={null}
                  ariaLabel={`Face-down card ${slotIndex + 1}`}
                  {...(slot.faceUpCard ? {} : topCard)}
                />
              ) : (
                <div className={PLAYING_CARD_PROPORTIONS} />
              )}
              {slot.faceUpCard && (
                <TableCard
                  card={slot.faceUpCard}
                  className='absolute top-[0.5em] left-0'
                  {...topCard}
                />
              )}
            </div>
          );
        })}
      </div>
      {description && <span className='sr-only'>{description}</span>}
    </div>
  );
}

function TableCard({
  className,
  card,
  ariaLabel,
  isSelectable = false,
  isSelected = false,
  onClick,
}: {
  className?: string;
  card: StandardPlayingCard | null;
  ariaLabel?: string;
  isSelectable?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  if (isSelectable) {
    return (
      <ShitheadPlayingCard
        card={card}
        border
        // A button sits on the text baseline, leaving a gap below
        className={cn('block', className)}
        ariaLabel={ariaLabel}
        isPressed={isSelected}
        onClick={onClick}
      />
    );
  }

  // The description above reads out the cards that can't be chosen
  return (
    <div aria-hidden='true' className={className}>
      <ShitheadPlayingCard card={card} border />
    </div>
  );
}
