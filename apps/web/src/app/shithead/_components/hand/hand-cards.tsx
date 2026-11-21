import { WandSparklesIcon } from 'lucide-react';
import { PlayingCard } from '~/components/ui/playing-card';
import { type StandardPlayingCard, suitColorClass } from '~/types/cards';
import { MAGIC_RANKS } from '~/types/games/shithead';
import { cardAriaLabel, isSameCard } from '~/utils/cards';
import { cn } from '~/utils/cn';
import { groupByRank, sortShitheadHand } from '~/utils/shithead/sort';

type HandCardsProps = {
  className?: string | undefined;
  cards: StandardPlayingCard[];
  selectedCards?: StandardPlayingCard[] | undefined;
  isCardSelectable?: ((card: StandardPlayingCard) => boolean) | undefined;
  /** Without it, the cards are only shown */
  onCardClick?: ((card: StandardPlayingCard) => void) | undefined;
};

/**
 * The cards in a column per rank, each overlapping the last so its corner
 * still shows. Usually 3 cards sit side by side, but after picking up the
 * pile a hand can hold most of the deck.
 */
export function HandCards({
  className,
  cards,
  selectedCards = [],
  isCardSelectable = () => true,
  onCardClick,
}: HandCardsProps) {
  const rankGroups = groupByRank(sortShitheadHand(cards));

  return (
    <ol
      aria-label='Your hand'
      className={cn(
        'm-0 flex list-none flex-wrap items-start justify-center gap-2 p-0 text-base min-[360px]:text-lg md:text-2xl',
        className,
      )}
    >
      {rankGroups.map((group) => (
        <li key={group.rank} className='flex flex-col'>
          {group.cards.map((card, cardIndex) => (
            <HandCard
              key={card.suit}
              // Leaves the rank and suit in the top corner showing
              className={cn(cardIndex > 0 && '-mt-[3.65em]')}
              card={card}
              isSelected={selectedCards.some((selected) =>
                isSameCard(selected, card),
              )}
              isSelectable={onCardClick !== undefined && isCardSelectable(card)}
              isDimmed={onCardClick !== undefined && !isCardSelectable(card)}
              onClick={() => onCardClick?.(card)}
            />
          ))}
        </li>
      ))}
    </ol>
  );
}

function HandCard({
  className,
  card,
  isSelected,
  isSelectable,
  isDimmed,
  onClick,
}: {
  className?: string;
  card: StandardPlayingCard;
  isSelected: boolean;
  isSelectable: boolean;
  isDimmed: boolean;
  onClick: () => void;
}) {
  const isMagic = MAGIC_RANKS.some((rank) => rank === card.rank);

  return (
    // Lifts a card above the next one's overlap while it has keyboard focus
    <div className={cn('relative flex has-focus-visible:z-10', className)}>
      <PlayingCard
        card={card}
        border
        // Darkened rather than faded, so the cards it overlaps don't show through
        className={cn(isDimmed && 'brightness-75')}
        ariaLabel={
          isMagic ? `${cardAriaLabel(card)}, magic card` : cardAriaLabel(card)
        }
        highlighted={isSelected}
        isPressed={isSelectable ? isSelected : undefined}
        onClick={isSelectable ? onClick : undefined}
      />
      {isMagic && (
        <WandSparklesIcon
          aria-hidden='true'
          className={cn(
            'pointer-events-none absolute top-[0.22em] right-[0.22em] size-[0.8em]',
            suitColorClass[card.suit],
            isDimmed && 'brightness-75',
          )}
        />
      )}
    </div>
  );
}
