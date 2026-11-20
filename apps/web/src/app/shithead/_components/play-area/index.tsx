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
  discardSize: number;
  /** Top-first */
  visibleDiscardCards: StandardPlayingCard[];
};

const describeCardCount = (count: number) =>
  `${count} ${count === 1 ? 'card' : 'cards'}`;

function describeDiscardPile(
  discardSize: number,
  visibleDiscardCards: StandardPlayingCard[],
) {
  if (discardSize === 0) return 'Empty';
  return `${describeCardCount(discardSize)}, ${visibleDiscardCards.map(cardAriaLabel).join(', on ')}`;
}

function PileCount({ count }: { count: number }) {
  return (
    // The deck and pile already say their counts to screen readers
    <span
      aria-hidden='true'
      className='justify-self-start text-xs font-bold text-white/70'
    >
      {count}
    </span>
  );
}

/** The deck beside the discard pile, which shows enough cards to see what to beat. */
export function PlayArea({
  className,
  deckSize,
  discardSize,
  visibleDiscardCards,
}: PlayAreaProps) {
  const isDeckEmpty = deckSize === 0;

  return (
    <div
      className={cn(
        'grid w-fit grid-cols-[auto_auto] items-center gap-x-3 gap-y-1',
        className,
      )}
    >
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
          {describeDiscardPile(discardSize, visibleDiscardCards)}
        </span>
      </PlayingCardDiscardPile>
      <PileCount count={deckSize} />
      <PileCount count={discardSize} />
    </div>
  );
}
