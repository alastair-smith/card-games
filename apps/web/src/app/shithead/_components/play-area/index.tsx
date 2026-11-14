import { PlayingCard } from '~/components/ui/playing-card';
import {
  PlayingCardDeck,
  PlayingCardDiscardPile,
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
        isFanned
        // Always as wide as the most cards the pile can show, seven: three of
        // a rank with four 5s among them, as a fourth of the rank would burn
        // it. A card, six fanned strips, the borders and the padding, so
        // nothing shifts as the pile grows
        className='min-w-[calc(3.75em+6*1.6em+0.112em+1rem)]'
      >
        {/* Bottom-first, so the top card overlaps the rest */}
        {[...visibleDiscardCards].reverse().map((card) => (
          <div key={`${card.suit}-${card.rank}`} aria-hidden='true'>
            <PlayingCard card={card} border />
          </div>
        ))}
        {/* Last, so the fan's first card is the first child */}
        <span className='sr-only'>
          {describeDiscardPile(visibleDiscardCards)}
        </span>
      </PlayingCardDiscardPile>
    </div>
  );
}
