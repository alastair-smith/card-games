import type { StandardPlayingCard } from '~/types/cards';
import { GameStage, type TableCardSlot } from '~/types/games/shithead';
import type { PlayerColor } from '~/utils/player-color';
import { getPlaySource } from '~/utils/shithead/play-source';
import { HandLayout } from './hand-layout';
import { PlayFromHand } from './play-from-hand';
import { PlayFromTable } from './play-from-table';
import { type CardSwap, SwapCards } from './swap-cards';

export type { CardSwap };

/** A face-up play that can't go on the pile is picked up with it. */
export type HandPlay =
  | { source: 'hand' | 'faceUp'; cards: StandardPlayingCard[] }
  | { source: 'faceDown'; slotIndex: number };

type HandProps = {
  className?: string | undefined;
  color: PlayerColor;
  gameStage: GameStage.SWAPPING | GameStage.IN_PROGRESS;
  cards: StandardPlayingCard[];
  tableCards: TableCardSlot[];
  isSwapConfirmed: boolean;
  isPlayersTurn: boolean;
  onSwapCards: (swap: CardSwap) => void;
  onConfirmSwap: () => void;
  onPlayCards: (play: HandPlay) => void;
};

/**
 * The player's own cards and the buttons for their next move: swapping before
 * the first turn, then their hand, then their cards on the table once their
 * hand is empty.
 */
export function Hand({
  className,
  color,
  gameStage,
  cards,
  tableCards,
  isSwapConfirmed,
  isPlayersTurn,
  onSwapCards,
  onConfirmSwap,
  onPlayCards,
}: HandProps) {
  if (gameStage === GameStage.SWAPPING) {
    return (
      <SwapCards
        className={className}
        color={color}
        cards={cards}
        tableCards={tableCards}
        isSwapConfirmed={isSwapConfirmed}
        onSwapCards={onSwapCards}
        onConfirmSwap={onConfirmSwap}
      />
    );
  }

  const playSource = getPlaySource({ cardCount: cards.length, tableCards });

  if (playSource === 'hand') {
    return (
      <PlayFromHand
        className={className}
        color={color}
        cards={cards}
        isPlayersTurn={isPlayersTurn}
        onPlayCards={(playedCards) =>
          onPlayCards({ source: 'hand', cards: playedCards })
        }
      />
    );
  }

  if (playSource === 'faceUp' || playSource === 'faceDown') {
    return (
      <PlayFromTable
        className={className}
        color={color}
        tableCards={tableCards}
        playSource={playSource}
        isPlayersTurn={isPlayersTurn}
        onPlayFaceUpCards={(playedCards) =>
          onPlayCards({ source: 'faceUp', cards: playedCards })
        }
        onPlayFaceDownCard={(slotIndex) =>
          onPlayCards({ source: 'faceDown', slotIndex })
        }
      />
    );
  }

  return (
    <HandLayout
      className={className}
      color={color}
      title='Your cards'
      isUserActing={false}
    >
      <p className='m-auto text-center'>You've played all your cards</p>
    </HandLayout>
  );
}
