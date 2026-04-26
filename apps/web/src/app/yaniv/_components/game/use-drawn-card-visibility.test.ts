import { act, renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { Rank, Suit } from '~/types/cards';
import { useDrawnCardVisibility } from './use-drawn-card-visibility';

const drawnCard = { suit: Suit.CLUBS, rank: Rank.ACE };
const otherCard = { suit: Suit.HEARTS, rank: Rank.FIVE };
const cards = [drawnCard, otherCard];

describe('useDrawnCardVisibility', () => {
  test('returns all cards when there is no drawn card', () => {
    const { result } = renderHook(() =>
      useDrawnCardVisibility(undefined, cards),
    );
    expect(result.current.visibleCards).toEqual(cards);
  });

  test('hides the drawn card from visible cards while it is in the overlay', () => {
    const { result } = renderHook(() =>
      useDrawnCardVisibility(drawnCard, cards),
    );
    expect(result.current.visibleCards).toEqual([otherCard]);
  });

  test('restores the drawn card to visible cards after the overlay is dismissed', () => {
    const { result } = renderHook(() =>
      useDrawnCardVisibility(drawnCard, cards),
    );
    act(() => result.current.onOverlayDismissed());
    expect(result.current.visibleCards).toEqual(cards);
  });

  test('hides the new drawn card again when a new drawn card arrives after dismissal', () => {
    const { result, rerender } = renderHook(
      ({ drawn }) => useDrawnCardVisibility(drawn, cards),
      { initialProps: { drawn: drawnCard } },
    );
    act(() => result.current.onOverlayDismissed());

    rerender({ drawn: otherCard });
    expect(result.current.visibleCards).toEqual([drawnCard]);
  });
});
