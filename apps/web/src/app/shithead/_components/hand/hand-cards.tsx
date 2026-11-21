import type { StandardPlayingCard } from '~/types/cards';
import { isSameCard } from '~/utils/cards';
import { cn } from '~/utils/cn';
import { sortShitheadHand } from '~/utils/shithead/sort';
import { HandCard } from './hand-card';

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
        <li key={`${card.suit}-${card.rank}`} className='flex'>
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
