import type { TableCardSlot } from '~/app/shithead/_components/table-cards';
import { Rank, Suit } from '~/types/cards';

export function buildTableCards(): TableCardSlot[] {
  return [
    {
      faceUpCard: { suit: Suit.HEARTS, rank: Rank.SEVEN },
      hasFaceDownCard: true,
    },
    {
      faceUpCard: { suit: Suit.SPADES, rank: Rank.KING },
      hasFaceDownCard: true,
    },
    {
      faceUpCard: { suit: Suit.DIAMONDS, rank: Rank.TEN },
      hasFaceDownCard: true,
    },
  ];
}
