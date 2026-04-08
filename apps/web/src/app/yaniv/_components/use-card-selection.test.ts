import { act, renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { Rank, Suit } from '~/types/cards';
import type { YanivPlayingCard } from '~/types/games/yaniv';
import { useCardSelection } from './use-card-selection';

const card = (suit: Suit, rank: Rank): YanivPlayingCard => ({ suit, rank });

const KING_OF_HEARTS = card(Suit.HEARTS, Rank.KING);
const THREE_OF_SPADES = card(Suit.SPADES, Rank.THREE);

describe('useCardSelection', () => {
  test('starts with no cards selected', () => {
    const { result } = renderHook(() =>
      useCardSelection([KING_OF_HEARTS, THREE_OF_SPADES]),
    );

    expect(result.current.selectedCards).toEqual([]);
  });

  test('adds a card to the selection', () => {
    const { result } = renderHook(() =>
      useCardSelection([KING_OF_HEARTS, THREE_OF_SPADES]),
    );

    act(() => result.current.toggleCard(KING_OF_HEARTS));

    expect(result.current.selectedCards).toEqual([KING_OF_HEARTS]);
  });

  test('removes a card from the selection when toggled again', () => {
    const { result } = renderHook(() =>
      useCardSelection([KING_OF_HEARTS, THREE_OF_SPADES]),
    );

    act(() => result.current.toggleCard(KING_OF_HEARTS));
    act(() => result.current.toggleCard(KING_OF_HEARTS));

    expect(result.current.selectedCards).toEqual([]);
  });

  test('allows selecting multiple cards', () => {
    const { result } = renderHook(() =>
      useCardSelection([KING_OF_HEARTS, THREE_OF_SPADES]),
    );

    act(() => result.current.toggleCard(KING_OF_HEARTS));
    act(() => result.current.toggleCard(THREE_OF_SPADES));

    expect(result.current.selectedCards).toHaveLength(2);
  });

  describe('clearing selection', () => {
    test('clears the selection when the hand changes', () => {
      const hand1 = [KING_OF_HEARTS, THREE_OF_SPADES];
      const hand2 = [
        card(Suit.CLUBS, Rank.FIVE),
        card(Suit.DIAMONDS, Rank.SEVEN),
      ];

      const { result, rerender } = renderHook(
        ({ hand }: { hand: YanivPlayingCard[] }) => useCardSelection(hand),
        { initialProps: { hand: hand1 } },
      );

      act(() => result.current.toggleCard(KING_OF_HEARTS));
      expect(result.current.selectedCards).toHaveLength(1);

      rerender({ hand: hand2 });

      expect(result.current.selectedCards).toEqual([]);
    });

    test('preserves the selection when the same cards are passed in a different order', () => {
      const { result, rerender } = renderHook(
        ({ hand }: { hand: YanivPlayingCard[] }) => useCardSelection(hand),
        { initialProps: { hand: [KING_OF_HEARTS, THREE_OF_SPADES] } },
      );

      act(() => result.current.toggleCard(KING_OF_HEARTS));

      rerender({ hand: [THREE_OF_SPADES, KING_OF_HEARTS] });

      expect(result.current.selectedCards).toHaveLength(1);
    });

    test('clears the selection when explicitly reset', () => {
      const { result } = renderHook(() =>
        useCardSelection([KING_OF_HEARTS, THREE_OF_SPADES]),
      );

      act(() => result.current.toggleCard(KING_OF_HEARTS));
      act(() => result.current.clearSelectedCards());

      expect(result.current.selectedCards).toEqual([]);
    });
  });
});
