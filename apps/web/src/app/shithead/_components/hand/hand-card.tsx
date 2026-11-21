import {
  ArrowDownIcon,
  EraserIcon,
  GhostIcon,
  type LucideIcon,
  Trash2Icon,
} from 'lucide-react';
import { PlayingCard } from '~/components/ui/playing-card';
import { Rank, type StandardPlayingCard, suitColorClass } from '~/types/cards';
import { cardAriaLabel } from '~/utils/cards';
import { cn } from '~/utils/cn';

// Each magic card's symbol shows what it does
const MAGIC_CARD_ICON: Partial<Record<Rank, LucideIcon>> = {
  [Rank.TWO]: EraserIcon,
  [Rank.FIVE]: GhostIcon,
  [Rank.SEVEN]: ArrowDownIcon,
  [Rank.TEN]: Trash2Icon,
};

type HandCardProps = {
  className?: string | undefined;
  card: StandardPlayingCard;
  isSelected: boolean;
  isSelectable: boolean;
  onClick: () => void;
};

/** A card in the player's hand, with a symbol on each magic card. */
export function HandCard({
  className,
  card,
  isSelected,
  isSelectable,
  onClick,
}: HandCardProps) {
  const MagicIcon = MAGIC_CARD_ICON[card.rank];

  return (
    <div className={cn('relative flex', className)}>
      <PlayingCard
        card={card}
        border
        ariaLabel={
          MagicIcon ? `${cardAriaLabel(card)}, magic card` : cardAriaLabel(card)
        }
        highlighted={isSelected}
        isPressed={isSelectable ? isSelected : undefined}
        onClick={isSelectable ? onClick : undefined}
      />
      {MagicIcon && (
        <MagicIcon
          aria-hidden='true'
          className={cn(
            'pointer-events-none absolute top-[0.22em] right-[0.22em] size-[0.8em]',
            suitColorClass[card.suit],
          )}
        />
      )}
    </div>
  );
}
