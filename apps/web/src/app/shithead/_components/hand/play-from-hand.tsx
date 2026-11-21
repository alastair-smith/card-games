import { CircleCheckIcon, LayersIcon } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { useCardSelection } from '~/hooks/use-card-selection';
import type { Rank, StandardPlayingCard } from '~/types/cards';
import type { PlayerColor } from '~/utils/player-color';
import { HandCards } from './hand-cards';
import { HandLayout } from './hand-layout';

type PlayFromHandProps = {
  className?: string | undefined;
  color: PlayerColor;
  cards: StandardPlayingCard[];
  playableRanks: Rank[];
  isPlayersTurn: boolean;
  onPlayCards: (cards: StandardPlayingCard[]) => void;
  onPickUpPile: () => void;
};

/** Plays one or more cards of a rank, or picks up the pile with no play. */
export function PlayFromHand({
  className,
  color,
  cards,
  playableRanks,
  isPlayersTurn,
  onPlayCards,
  onPickUpPile,
}: PlayFromHandProps) {
  const { selectedCards, toggleCard, clearSelectedCards } =
    useCardSelection(cards);

  const isCardPlayable = (card: StandardPlayingCard) =>
    playableRanks.includes(card.rank);
  const hasPlay = cards.some(isCardPlayable);

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
      hint={
        isPlayersTurn && !hasPlay
          ? 'Nothing in your hand can be played, so pick up the pile'
          : undefined
      }
      isUserActing={isPlayersTurn}
      actions={
        isPlayersTurn &&
        (hasPlay ? (
          <Button
            disabled={selectedCards.length === 0}
            onClick={() => onPlayCards(selectedCards)}
          >
            <CircleCheckIcon />
            Play Cards
          </Button>
        ) : (
          <Button onClick={onPickUpPile}>
            <LayersIcon />
            Pick Up Pile
          </Button>
        ))
      }
    >
      <HandCards
        cards={cards}
        selectedCards={selectedCards}
        isCardSelectable={isCardPlayable}
        onCardClick={isPlayersTurn ? handleCardClick : undefined}
      />
    </HandLayout>
  );
}
