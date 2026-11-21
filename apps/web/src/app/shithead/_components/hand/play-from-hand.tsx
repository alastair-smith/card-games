import { CircleCheckIcon } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { useCardSelection } from '~/hooks/use-card-selection';
import type { StandardPlayingCard } from '~/types/cards';
import type { PlayerColor } from '~/utils/player-color';
import { HandCards } from './hand-cards';
import { HandLayout } from './hand-layout';

type PlayFromHandProps = {
  className?: string | undefined;
  color: PlayerColor;
  cards: StandardPlayingCard[];
  isPlayersTurn: boolean;
  onPlayCards: (cards: StandardPlayingCard[]) => void;
};

/** Plays one or more cards of a rank. */
export function PlayFromHand({
  className,
  color,
  cards,
  isPlayersTurn,
  onPlayCards,
}: PlayFromHandProps) {
  const { selectedCards, toggleCard, clearSelectedCards } =
    useCardSelection(cards);

  // Cards played together share a rank, so choosing another rank starts again
  const handleCardClick = (card: StandardPlayingCard) => {
    if (selectedCards.some((selected) => selected.rank !== card.rank)) {
      clearSelectedCards();
    }
    toggleCard(card);
  };

  return (
    <HandLayout
      className={className}
      color={color}
      title='Your hand'
      isUserActing={isPlayersTurn}
      actions={
        isPlayersTurn && (
          <Button
            disabled={selectedCards.length === 0}
            onClick={() => onPlayCards(selectedCards)}
          >
            <CircleCheckIcon />
            Play Cards
          </Button>
        )
      }
    >
      <HandCards
        cards={cards}
        selectedCards={selectedCards}
        onCardClick={isPlayersTurn ? handleCardClick : undefined}
      />
    </HandLayout>
  );
}
