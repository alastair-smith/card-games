import { renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { useDeckEmptyReaction } from './use-deck-empty-reaction';

describe('useDeckEmptyReaction', () => {
  test('has no reaction while the deck has cards', () => {
    const { result, rerender } = renderHook(
      ({ deckSize }) => useDeckEmptyReaction(deckSize),
      { initialProps: { deckSize: 10 } },
    );
    rerender({ deckSize: 4 });
    expect(result.current).toBeNull();
  });

  test('rains 🫥 when the deck empties', () => {
    const { result, rerender } = renderHook(
      ({ deckSize }) => useDeckEmptyReaction(deckSize),
      { initialProps: { deckSize: 2 } },
    );
    rerender({ deckSize: 0 });
    expect(result.current).toEqual(expect.objectContaining({ emoji: '🫥' }));
  });

  test('keeps the same reaction once the deck has emptied, so it rains once', () => {
    const { result, rerender } = renderHook(
      ({ deckSize }) => useDeckEmptyReaction(deckSize),
      { initialProps: { deckSize: 2 } },
    );
    rerender({ deckSize: 0 });
    const firstReaction = result.current;
    rerender({ deckSize: 0 });
    expect(result.current).toBe(firstReaction);
  });

  test('does not rain when joining a game whose deck is already empty', () => {
    const { result } = renderHook(() => useDeckEmptyReaction(0));
    expect(result.current).toBeNull();
  });
});
