import {
  ArrowDownIcon,
  EraserIcon,
  GhostIcon,
  type LucideIcon,
  Trash2Icon,
} from 'lucide-react';
import { PlayingCard } from '~/components/ui/playing-card';
import { Rank, type StandardPlayingCard } from '~/types/cards';
import { cardAriaLabel } from '~/utils/cards';

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
  const magicIcon = MAGIC_CARD_ICON[card.rank];

  return (
    <PlayingCard
      className={className}
      card={card}
      border
      cornerIcon={magicIcon}
      ariaLabel={
        magicIcon ? `${cardAriaLabel(card)}, magic card` : cardAriaLabel(card)
      }
      highlighted={isSelected}
      isPressed={isSelectable ? isSelected : undefined}
      onClick={isSelectable ? onClick : undefined}
    />
  );
}
