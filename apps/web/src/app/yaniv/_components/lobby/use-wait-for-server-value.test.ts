import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useWaitForServerValue } from './use-wait-for-server-value';

const TIMEOUT_MS = 5000;

const settled = (promise: Promise<void>) => {
  let isSettled = false;
  promise.then(() => {
    isSettled = true;
  });
  return () => isSettled;
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useWaitForServerValue', () => {
  test('finishes straight away when the server already has the value', async () => {
    const { result } = renderHook(() => useWaitForServerValue(5));

    const hasFinished = settled(result.current(5));
    await act(async () => {});

    expect(hasFinished()).toBe(true);
  });

  test('keeps waiting while the server is still on the old value', async () => {
    const { result } = renderHook(() => useWaitForServerValue(5));

    const hasFinished = settled(result.current(7));
    await act(async () => {});

    expect(hasFinished()).toBe(false);
  });

  test('finishes when the value arrives from the server', async () => {
    const { result, rerender } = renderHook(
      ({ serverValue }) => useWaitForServerValue(serverValue),
      { initialProps: { serverValue: 5 } },
    );

    const hasFinished = settled(result.current(7));
    rerender({ serverValue: 7 });
    await act(async () => {});

    expect(hasFinished()).toBe(true);
  });

  test('keeps waiting when a different value arrives from the server', async () => {
    const { result, rerender } = renderHook(
      ({ serverValue }) => useWaitForServerValue(serverValue),
      { initialProps: { serverValue: 5 } },
    );

    const hasFinished = settled(result.current(7));
    rerender({ serverValue: 9 });
    await act(async () => {});

    expect(hasFinished()).toBe(false);
  });

  test('gives up waiting when the value never arrives', async () => {
    const { result } = renderHook(() => useWaitForServerValue(5));

    const hasFinished = settled(result.current(7));
    await act(async () => {
      vi.advanceTimersByTime(TIMEOUT_MS);
    });

    expect(hasFinished()).toBe(true);
  });

  test('finishes each wait with the value it was waiting for', async () => {
    const { result, rerender } = renderHook(
      ({ serverValue }) => useWaitForServerValue(serverValue),
      { initialProps: { serverValue: 5 } },
    );

    const hasFinishedSeven = settled(result.current(7));
    const hasFinishedNine = settled(result.current(9));

    rerender({ serverValue: 9 });
    await act(async () => {});

    expect(hasFinishedSeven()).toBe(false);
    expect(hasFinishedNine()).toBe(true);
  });
});
