import { LockIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import type { StandardPlayingCard } from '~/types/cards';
import type { TableCardSlot } from '~/types/games/shithead';
import { isSameCard } from '~/utils/cards';
import type { PlayerColor } from '~/utils/player-color';
import { TableCards } from '../table-cards';
import { HandCards } from './hand-cards';
import { HandLayout } from './hand-layout';

export type CardSwap = {
  handCard: StandardPlayingCard;
  faceUpCard: StandardPlayingCard;
};

type SwapCardsProps = {
  className?: string | undefined;
  color: PlayerColor;
  cards: StandardPlayingCard[];
  tableCards: TableCardSlot[];
  isSwapConfirmed: boolean;
  onSwapCards: (swap: CardSwap) => void;
  onConfirmSwap: () => void;
};

type PendingSwap = {
  handCard: StandardPlayingCard | null;
  faceUpCard: StandardPlayingCard | null;
};

const NO_PENDING_SWAP: PendingSwap = { handCard: null, faceUpCard: null };

/** Choosing a hand card and a face-up card swaps them, until confirmed. */
export function SwapCards({
  className,
  color,
  cards,
  tableCards,
  isSwapConfirmed,
  onSwapCards,
  onConfirmSwap,
}: SwapCardsProps) {
  const [pendingSwap, setPendingSwap] = useState(NO_PENDING_SWAP);

  const choose = (choice: Partial<PendingSwap>) => {
    const { handCard, faceUpCard } = { ...pendingSwap, ...choice };
    if (handCard && faceUpCard) {
      onSwapCards({ handCard, faceUpCard });
      setPendingSwap(NO_PENDING_SWAP);
      return;
    }
    setPendingSwap({ handCard, faceUpCard });
  };

  const handleHandCardClick = (card: StandardPlayingCard) =>
    choose({ handCard: isSameCard(pendingSwap.handCard, card) ? null : card });

  const handleSlotClick = (slotIndex: number) => {
    const card = tableCards[slotIndex]?.faceUpCard;
    if (!card) return;
    choose({
      faceUpCard: isSameCard(pendingSwap.faceUpCard, card) ? null : card,
    });
  };

  const faceUpSlotIndexes = tableCards.flatMap((slot, slotIndex) =>
    slot.faceUpCard ? [slotIndex] : [],
  );
  const selectedSlotIndexes = tableCards.flatMap((slot, slotIndex) =>
    isSameCard(slot.faceUpCard, pendingSwap.faceUpCard) ? [slotIndex] : [],
  );

  return (
    <HandLayout
      className={className}
      color={color}
      title={isSwapConfirmed ? 'Your cards' : 'Swap your cards'}
      hint={
        isSwapConfirmed
          ? 'Locked in. The game starts once everyone has confirmed'
          : 'Choose a hand card and a face-up card to swap them, as often as you like'
      }
      isUserActing={!isSwapConfirmed}
      actions={
        !isSwapConfirmed && (
          <Button onClick={onConfirmSwap}>
            <LockIcon />
            Confirm Cards
          </Button>
        )
      }
    >
      <HandCards
        cards={cards}
        selectedCards={pendingSwap.handCard ? [pendingSwap.handCard] : []}
        onCardClick={isSwapConfirmed ? undefined : handleHandCardClick}
      />
      <TableCards
        className='self-center text-base min-[360px]:text-lg sm:text-lg md:text-2xl'
        slots={tableCards}
        selectableSlotIndexes={faceUpSlotIndexes}
        selectedSlotIndexes={selectedSlotIndexes}
        onSlotClick={isSwapConfirmed ? undefined : handleSlotClick}
      />
    </HandLayout>
  );
}
