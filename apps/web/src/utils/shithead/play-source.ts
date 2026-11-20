import type { TableCardSlot } from '~/types/games/shithead';

export type PlaySource = 'hand' | 'faceUp' | 'faceDown';

/** Where a player plays from next, or `null` once they have no cards left. */
export function getPlaySource({
  cardCount,
  tableCards,
}: {
  cardCount: number;
  tableCards: TableCardSlot[];
}): PlaySource | null {
  if (cardCount > 0) return 'hand';
  if (tableCards.some((slot) => slot.faceUpCard !== null)) return 'faceUp';
  if (tableCards.some((slot) => slot.hasFaceDownCard)) return 'faceDown';
  return null;
}
