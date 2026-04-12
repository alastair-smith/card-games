import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { UserId } from '~/types/entities';
import type { ReactionEmoji } from '~/types/game';
import { usePageReactions } from './use-page-reactions';

type TestPlayer = {
  id: UserId;
  isYanivCalled: boolean;
  emojiReaction?: { emoji: ReactionEmoji; id: number };
};

const alice: TestPlayer = { id: '1' as UserId, isYanivCalled: false };
const bob: TestPlayer = { id: '2' as UserId, isYanivCalled: false };

const thumbsUp = '👍' as ReactionEmoji;
const heart = '❤️' as ReactionEmoji;

describe('usePageReactions', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('returns no reactions on initial render', () => {
    const { result } = renderHook(() => usePageReactions([alice, bob]));
    expect(result.current).toEqual([]);
  });

  test('does not add a reaction on initial render when a player already has one', () => {
    const { result } = renderHook(() =>
      usePageReactions([
        { ...alice, emojiReaction: { emoji: thumbsUp, id: 1 } },
        bob,
      ]),
    );
    expect(result.current).toEqual([]);
  });

  test('does not add a megaphone reaction on initial render when Yaniv is already called', () => {
    const { result } = renderHook(() =>
      usePageReactions([{ ...alice, isYanivCalled: true }, bob]),
    );
    expect(result.current).toEqual([]);
  });

  test('adds a reaction when a player sends an emoji', () => {
    const { result, rerender } = renderHook(
      ({ players }) => usePageReactions(players),
      { initialProps: { players: [alice, bob] } },
    );

    rerender({
      players: [{ ...alice, emojiReaction: { emoji: thumbsUp, id: 1 } }, bob],
    });

    expect(result.current).toHaveLength(1);
    expect(result.current).toContainEqual(
      expect.objectContaining({ emoji: thumbsUp }),
    );
  });

  test('does not add a duplicate reaction when the same reaction ID persists', () => {
    const withReaction = {
      ...alice,
      emojiReaction: { emoji: thumbsUp, id: 1 },
    };
    const { result, rerender } = renderHook(
      ({ players }) => usePageReactions(players),
      { initialProps: { players: [alice, bob] } },
    );

    rerender({ players: [withReaction, bob] });
    rerender({ players: [withReaction, bob] });

    expect(result.current).toHaveLength(1);
  });

  test('adds a new reaction when the reaction ID changes', () => {
    const { result, rerender } = renderHook(
      ({ players }) => usePageReactions(players),
      { initialProps: { players: [alice, bob] } },
    );

    rerender({
      players: [{ ...alice, emojiReaction: { emoji: thumbsUp, id: 1 } }, bob],
    });
    rerender({
      players: [{ ...alice, emojiReaction: { emoji: heart, id: 2 } }, bob],
    });

    expect(result.current).toHaveLength(2);
  });

  test('adds a megaphone reaction when a player calls Yaniv', () => {
    const { result, rerender } = renderHook(
      ({ players }) => usePageReactions(players),
      { initialProps: { players: [alice, bob] } },
    );

    rerender({ players: [{ ...alice, isYanivCalled: true }, bob] });

    expect(result.current).toHaveLength(1);
    expect(result.current).toContainEqual(
      expect.objectContaining({ emoji: '📢' }),
    );
  });

  test('does not add a duplicate megaphone when Yaniv called flag remains true', () => {
    const aliceCalledYaniv = { ...alice, isYanivCalled: true };
    const { result, rerender } = renderHook(
      ({ players }) => usePageReactions(players),
      { initialProps: { players: [alice, bob] } },
    );

    rerender({ players: [aliceCalledYaniv, bob] });
    rerender({ players: [aliceCalledYaniv, bob] });

    expect(result.current).toHaveLength(1);
  });

  test('adds reactions for multiple players sending emojis at the same time', () => {
    const { result, rerender } = renderHook(
      ({ players }) => usePageReactions(players),
      { initialProps: { players: [alice, bob] } },
    );

    rerender({
      players: [
        { ...alice, emojiReaction: { emoji: thumbsUp, id: 1 } },
        { ...bob, emojiReaction: { emoji: heart, id: 2 } },
      ],
    });

    expect(result.current).toHaveLength(2);
  });

  test('adds megaphone reactions when multiple players call Yaniv at the same time', () => {
    const { result, rerender } = renderHook(
      ({ players }) => usePageReactions(players),
      { initialProps: { players: [alice, bob] } },
    );

    rerender({
      players: [
        { ...alice, isYanivCalled: true },
        { ...bob, isYanivCalled: true },
      ],
    });

    expect(result.current).toHaveLength(2);
    expect(result.current.every((r) => r.emoji === '📢')).toBe(true);
  });

  test('reactions expire after 5 seconds', () => {
    const { result, rerender } = renderHook(
      ({ players }) => usePageReactions(players),
      { initialProps: { players: [alice, bob] } },
    );

    rerender({
      players: [{ ...alice, emojiReaction: { emoji: thumbsUp, id: 1 } }, bob],
    });
    expect(result.current).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current).toHaveLength(0);
  });

  test('concurrent reactions from different players each expire independently', () => {
    const { result, rerender } = renderHook(
      ({ players }) => usePageReactions(players),
      { initialProps: { players: [alice, bob] } },
    );

    rerender({
      players: [
        { ...alice, emojiReaction: { emoji: thumbsUp, id: 1 } },
        { ...bob, emojiReaction: { emoji: heart, id: 2 } },
      ],
    });
    expect(result.current).toHaveLength(2);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current).toHaveLength(0);
  });

  test('clears pending timeouts on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    const { rerender, unmount } = renderHook(
      ({ players }) => usePageReactions(players),
      { initialProps: { players: [alice, bob] } },
    );

    rerender({
      players: [{ ...alice, emojiReaction: { emoji: thumbsUp, id: 1 } }, bob],
    });
    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
