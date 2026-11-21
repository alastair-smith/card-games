import { useEffect, useState } from 'react';
import type { PlayingCardValue } from '~/types/cards';

export function useCardSelection<Card extends PlayingCardValue>(hand: Card[]) {
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);

  const handKey = hand
    .map(({ suit, rank }) => `${suit}:${rank}`)
    .sort()
    .join('-');

  // biome-ignore lint/correctness/useExhaustiveDependencies: handKey drives when to clear, not what to render
  useEffect(() => {
    setSelectedCards([]);
  }, [handKey]);

  const toggleCard = (card: Card) => {
    setSelectedCards((prev) => {
      const alreadySelected = prev.some(
        (selected) =>
          selected.rank === card.rank && selected.suit === card.suit,
      );
      if (alreadySelected) {
        return prev.filter(
          (selected) =>
            selected.rank !== card.rank || selected.suit !== card.suit,
        );
      }
      return [...prev, card];
    });
  };

  const clearSelectedCards = () => setSelectedCards([]);

  return { selectedCards, toggleCard, clearSelectedCards };
}
