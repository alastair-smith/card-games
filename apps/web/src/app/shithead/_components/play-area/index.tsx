import { PlayingCard } from '~/components/ui/playing-card';
import {
  PlayingCardDeck,
  PlayingCardDiscardPile,
  PlayingCardStack,
} from '~/components/ui/playing-card-stacks';
import type { StandardPlayingCard } from '~/types/cards';
import { cardAriaLabel } from '~/utils/cards';
import { cn } from '~/utils/cn';

type PlayAreaProps = {
  className?: string;
  deckSize: number;
  /** Top-first */
  visibleDiscardCards: StandardPlayingCard[];
};

function describeDiscardPile(visibleDiscardCards: StandardPlayingCard[]) {
  if (visibleDiscardCards.length === 0) return 'Empty';
  return visibleDiscardCards.map(cardAriaLabel).join(', on ');
}

/** The deck beside the discard pile, which shows enough cards to see what to beat. */
export function PlayArea({
  className,
  deckSize,
  visibleDiscardCards,
}: PlayAreaProps) {
  const isDeckEmpty = deckSize === 0;

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <PlayingCardDeck
        isEmpty={isDeckEmpty}
        ariaLabel={isDeckEmpty ? 'Deck, empty' : `Deck, ${deckSize} cards`}
      />
      <PlayingCardDiscardPile
        // Room for 7 cards
        className='min-w-[calc(3.75em+6*1.6em+0.112em+1rem)]'
      >
        <div aria-hidden='true'>
          <PlayingCardStack>
            {[...visibleDiscardCards].reverse().map((card) => (
              <PlayingCard
                key={`${card.suit}-${card.rank}`}
                card={card}
                border
              />
            ))}
          </PlayingCardStack>
        </div>
        <span className='sr-only'>
          {describeDiscardPile(visibleDiscardCards)}
        </span>
      </PlayingCardDiscardPile>
    </div>
  );
}
