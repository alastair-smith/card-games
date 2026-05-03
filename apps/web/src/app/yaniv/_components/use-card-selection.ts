import { useEffect, useState } from 'react';
import { JOKER_RANK } from '~/types/cards';
import type { YanivPlayingCard } from '~/types/games/yaniv';

export function useCardSelection(hand: YanivPlayingCard[]) {
  const [selectedCards, setSelectedCards] = useState<YanivPlayingCard[]>([]);

  const handKey = hand
    .map(({ suit, rank }) => `${suit}:${rank}`)
    .sort()
    .join('-');

  // biome-ignore lint/correctness/useExhaustiveDependencies: handKey drives when to clear, not what to render
  useEffect(() => {
    setSelectedCards([]);
  }, [handKey]);

  const toggleCard = (card: YanivPlayingCard) => {
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
      const newCard =
        card.rank === JOKER_RANK
          ? { suit: card.suit, rank: card.rank }
          : { suit: card.suit, rank: card.rank };
      return [...prev, newCard];
    });
  };

  const clearSelectedCards = () => setSelectedCards([]);

  return { selectedCards, toggleCard, clearSelectedCards };
}
