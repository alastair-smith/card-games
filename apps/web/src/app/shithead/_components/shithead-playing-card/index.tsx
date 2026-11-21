import {
  ArrowDownIcon,
  EraserIcon,
  GhostIcon,
  type LucideIcon,
  Trash2Icon,
} from 'lucide-react';
import type { ComponentProps } from 'react';
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

type ShitheadPlayingCardProps = Omit<
  ComponentProps<typeof PlayingCard>,
  'card' | 'cornerIcon'
> & {
  card: StandardPlayingCard | null;
};

/** A playing card with a symbol on each magic card for what it does. */
export function ShitheadPlayingCard({
  card,
  ariaLabel,
  ...props
}: ShitheadPlayingCardProps) {
  const magicIcon = card ? MAGIC_CARD_ICON[card.rank] : undefined;

  return (
    <PlayingCard
      {...props}
      card={card}
      cornerIcon={magicIcon}
      ariaLabel={
        ariaLabel ??
        (magicIcon ? `${cardAriaLabel(card)}, magic card` : undefined)
      }
    />
  );
}
