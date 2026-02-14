import { PlayingCard } from '~/components/ui/playing-card';
import {
  PlayingCardDeck,
  PlayingCardDiscardPile,
  PlayingCardStack,
} from '~/components/ui/playing-card-stacks';
import type { PlayingCardValue } from '~/types/cards';
import { cn } from '~/utils/cn';

type PlayAreaProps = {
  className?: string;
  discardCard: PlayingCardValue | null;
  playedCards: PlayingCardValue[];
  onDiscardClick?: () => void;
  onDeckClick?: () => void;
  isHighlighted?: boolean;
};

export default function PlayArea({
  className,
  discardCard,
  playedCards,
  onDiscardClick,
  onDeckClick,
  isHighlighted,
}: PlayAreaProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 justify-center items-center',
        className,
      )}
    >
      <div
        className={cn(
          'flex gap-3 items-center rounded-lg p-2',
          isHighlighted ? 'animate-pulse-bg' : '',
        )}
      >
        <PlayingCardDeck onClick={onDeckClick} />
        <PlayingCardDiscardPile>
          {discardCard && (
            <PlayingCard card={discardCard} onClick={onDiscardClick} />
          )}
        </PlayingCardDiscardPile>
      </div>

      <PlayingCardStack>
        {playedCards?.map((card) => (
          <PlayingCard key={`${card.suit}-${card.rank}`} card={card} border />
        ))}
      </PlayingCardStack>
    </div>
  );
}
