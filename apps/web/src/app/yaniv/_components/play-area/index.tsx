import { PlayingCard } from '~/components/ui/playing-card';
import {
  PlayingCardDeck,
  PlayingCardDiscardPile,
  PlayingCardStack,
} from '~/components/ui/playing-card-stacks';
import { DiscardPileSingleCard } from '~/components/ui/playing-card-stacks/playing-card-discard-pile.stories';
import type { PlayingCardValue } from '~/types/cards';
import { cn } from '~/utils/cn';

type PlayAreaProps = {
  className?: string;
  discardCard: PlayingCardValue | null;
  playedCards: PlayingCardValue[];
};

export default function PlayArea({
  className,
  discardCard,
  playedCards,
}: PlayAreaProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 justify-center items-center',
        className,
      )}
    >
      <div className='flex gap-3 items-center'>
        <PlayingCardDeck />
        <PlayingCardDiscardPile>
          {discardCard && <PlayingCard card={discardCard} />}
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
