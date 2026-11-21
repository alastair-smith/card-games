import {
  ArrowDownIcon,
  EraserIcon,
  GhostIcon,
  type LucideIcon,
  Trash2Icon,
} from 'lucide-react';
import { PlayingCard } from '~/components/ui/playing-card';
import { Rank, type StandardPlayingCard, suitColorClass } from '~/types/cards';
import { cardAriaLabel, isSameCard } from '~/utils/cards';
import { cn } from '~/utils/cn';
import { sortShitheadHand } from '~/utils/shithead/sort';

// Each magic card's symbol shows what it does
const MAGIC_CARD_ICON: Partial<Record<Rank, LucideIcon>> = {
  [Rank.TWO]: EraserIcon,
  [Rank.FIVE]: GhostIcon,
  [Rank.SEVEN]: ArrowDownIcon,
  [Rank.TEN]: Trash2Icon,
};

type HandCardsProps = {
  className?: string | undefined;
  cards: StandardPlayingCard[];
  selectedCards?: StandardPlayingCard[] | undefined;
  isCardSelectable?: ((card: StandardPlayingCard) => boolean) | undefined;
  /** Without it, the cards are only shown */
  onCardClick?: ((card: StandardPlayingCard) => void) | undefined;
};

export function HandCards({
  className,
  cards,
  selectedCards = [],
  isCardSelectable = () => true,
  onCardClick,
}: HandCardsProps) {
  return (
    <ol
      aria-label='Your hand'
      className={cn(
        'm-0 flex list-none flex-wrap justify-center gap-1 p-0 text-base min-[360px]:gap-2 min-[360px]:text-lg md:text-2xl',
        className,
      )}
    >
      {sortShitheadHand(cards).map((card) => (
        <li key={`${card.suit}-${card.rank}`} className='relative flex'>
          <HandCard
            card={card}
            isSelected={selectedCards.some((selected) =>
              isSameCard(selected, card),
            )}
            isSelectable={onCardClick !== undefined && isCardSelectable(card)}
            onClick={() => onCardClick?.(card)}
          />
        </li>
      ))}
    </ol>
  );
}

function HandCard({
  card,
  isSelected,
  isSelectable,
  onClick,
}: {
  card: StandardPlayingCard;
  isSelected: boolean;
  isSelectable: boolean;
  onClick: () => void;
}) {
  const MagicIcon = MAGIC_CARD_ICON[card.rank];

  return (
    <>
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
    </>
  );
}
