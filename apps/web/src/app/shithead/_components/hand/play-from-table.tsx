import { CircleCheckIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { useCardSelection } from '~/hooks/use-card-selection';
import type { StandardPlayingCard } from '~/types/cards';
import type { TableCardSlot } from '~/types/games/shithead';
import { isSameCard } from '~/utils/cards';
import type { PlayerColor } from '~/utils/player-color';
import { TableCards } from '../table-cards';
import { HandLayout } from './hand-layout';

type PlayFromTableProps = {
  className?: string | undefined;
  color: PlayerColor;
  tableCards: TableCardSlot[];
  playSource: 'faceUp' | 'faceDown';
  isPlayersTurn: boolean;
  onPlayFaceUpCards: (cards: StandardPlayingCard[]) => void;
  onPlayFaceDownCard: (slotIndex: number) => void;
};

/** Plays the face-up cards once the hand is empty, then the face-down ones. */
export function PlayFromTable({
  className,
  color,
  tableCards,
  playSource,
  isPlayersTurn,
  onPlayFaceUpCards,
  onPlayFaceDownCard,
}: PlayFromTableProps) {
  const faceUpCards = tableCards.flatMap((slot) =>
    slot.faceUpCard ? [slot.faceUpCard] : [],
  );
  const { selectedCards, toggleCard, clearSelectedCards } =
    useCardSelection(faceUpCards);
  const [chosenFaceDownSlot, setChosenFaceDownSlot] = useState<number | null>(
    null,
  );

  // A chosen card that's since been played no longer counts
  const selectedFaceDownSlot =
    chosenFaceDownSlot !== null &&
    tableCards[chosenFaceDownSlot]?.hasFaceDownCard
      ? chosenFaceDownSlot
      : null;

  const faceUpSelection = {
    selectableSlotIndexes: tableCards.flatMap((slot, slotIndex) =>
      slot.faceUpCard ? [slotIndex] : [],
    ),
    selectedSlotIndexes: tableCards.flatMap((slot, slotIndex) =>
      selectedCards.some((selected) => isSameCard(selected, slot.faceUpCard))
        ? [slotIndex]
        : [],
    ),
    onSlotClick: (slotIndex: number) => {
      const card = tableCards[slotIndex]?.faceUpCard;
      if (!card) return;
      // Cards played together share a rank, so another rank starts again
      if (selectedCards.some((selected) => selected.rank !== card.rank)) {
        clearSelectedCards();
      }
      toggleCard(card);
    },
  };

  const faceDownSelection = {
    selectableSlotIndexes: tableCards.flatMap((slot, slotIndex) =>
      slot.hasFaceDownCard ? [slotIndex] : [],
    ),
    selectedSlotIndexes:
      selectedFaceDownSlot === null ? [] : [selectedFaceDownSlot],
    // Only one face-down card can be turned over at a time
    onSlotClick: (slotIndex: number) =>
      setChosenFaceDownSlot(
        slotIndex === selectedFaceDownSlot ? null : slotIndex,
      ),
  };

  const selection =
    playSource === 'faceUp' ? faceUpSelection : faceDownSelection;

  return (
    <HandLayout
      className={className}
      color={color}
      title={
        playSource === 'faceUp' ? 'Your face-up cards' : 'Your face-down cards'
      }
      hint={
        isPlayersTurn && playSource === 'faceDown'
          ? 'Choose one to turn over'
          : undefined
      }
      isUserActing={isPlayersTurn}
      actions={
        isPlayersTurn &&
        (playSource === 'faceUp' ? (
          <Button
            disabled={selectedCards.length === 0}
            onClick={() => onPlayFaceUpCards(selectedCards)}
          >
            <CircleCheckIcon />
            Play Cards
          </Button>
        ) : (
          <Button
            disabled={selectedFaceDownSlot === null}
            onClick={() => {
              if (selectedFaceDownSlot !== null) {
                onPlayFaceDownCard(selectedFaceDownSlot);
              }
            }}
          >
            <CircleCheckIcon />
            Play Card
          </Button>
        ))
      }
    >
      <TableCards
        className='self-center text-base min-[360px]:text-lg sm:text-lg md:text-2xl'
        slots={tableCards}
        {...selection}
        onSlotClick={isPlayersTurn ? selection.onSlotClick : undefined}
      />
    </HandLayout>
  );
}
