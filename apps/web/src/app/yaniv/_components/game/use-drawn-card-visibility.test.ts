import { act, renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { Rank, Suit } from '~/types/cards';
import { useDrawnCardVisibility } from './use-drawn-card-visibility';

const drawnCard = { suit: Suit.CLUBS, rank: Rank.ACE };
const otherCard = { suit: Suit.HEARTS, rank: Rank.FIVE };

describe('useDrawnCardVisibility', () => {
  test('is not shown in overlay when there is no drawn card', () => {
    const { result } = renderHook(() => useDrawnCardVisibility(undefined));
    expect(result.current.isShownInOverlay).toBe(false);
  });

  test('is shown in overlay while the drawn card has not been dismissed', () => {
    const { result } = renderHook(() => useDrawnCardVisibility(drawnCard));
    expect(result.current.isShownInOverlay).toBe(true);
  });

  test('is no longer shown in overlay after the overlay is dismissed', () => {
    const { result } = renderHook(() => useDrawnCardVisibility(drawnCard));
    act(() => result.current.onOverlayDismissed());
    expect(result.current.isShownInOverlay).toBe(false);
  });

  test('is shown in overlay again when a new drawn card arrives after dismissal', () => {
    const { result, rerender } = renderHook(
      ({ drawn }) => useDrawnCardVisibility(drawn),
      { initialProps: { drawn: drawnCard } },
    );
    act(() => result.current.onOverlayDismissed());

    rerender({ drawn: otherCard });
    expect(result.current.isShownInOverlay).toBe(true);
  });
});
