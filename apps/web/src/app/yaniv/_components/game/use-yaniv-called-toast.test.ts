import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { PlayerName, UserId } from '~/types/entities';
import { useYanivCalledToast } from './use-yaniv-called-toast';

vi.mock('~/components/ui/toast', () => ({
  toast: { info: vi.fn() },
}));

import { toast } from '~/components/ui/toast';

const alice = {
  id: '1' as UserId,
  name: 'Alice' as PlayerName,
  isYanivCalled: false,
};

const bob = {
  id: '2' as UserId,
  name: 'Bob' as PlayerName,
  isYanivCalled: false,
};

describe('useYanivCalledToast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('does not fire a toast on initial render when no player has called Yaniv', () => {
    renderHook(() => useYanivCalledToast([alice, bob]));
    expect(toast.info).not.toHaveBeenCalled();
  });

  test('does not fire a toast when a player already had Yaniv called on initial render', () => {
    renderHook(() =>
      useYanivCalledToast([{ ...alice, isYanivCalled: true }, bob]),
    );
    expect(toast.info).not.toHaveBeenCalled();
  });

  test('fires a toast when a player calls Yaniv', () => {
    const { rerender } = renderHook(
      ({ players }) => useYanivCalledToast(players),
      { initialProps: { players: [alice, bob] } },
    );

    rerender({ players: [{ ...alice, isYanivCalled: true }, bob] });

    expect(toast.info).toHaveBeenCalledOnce();
    expect(toast.info).toHaveBeenCalledWith('Alice has called Yaniv!');
  });

  test('does not fire a duplicate toast when Yaniv called flag remains true', () => {
    const aliceCalledYaniv = { ...alice, isYanivCalled: true };
    const { rerender } = renderHook(
      ({ players }) => useYanivCalledToast(players),
      { initialProps: { players: [alice, bob] } },
    );

    rerender({ players: [aliceCalledYaniv, bob] });
    rerender({ players: [aliceCalledYaniv, bob] });

    expect(toast.info).toHaveBeenCalledOnce();
  });

  test('fires a toast again when a player calls Yaniv in a subsequent round', () => {
    const { rerender } = renderHook(
      ({ players }) => useYanivCalledToast(players),
      { initialProps: { players: [alice, bob] } },
    );

    rerender({ players: [{ ...alice, isYanivCalled: true }, bob] });
    rerender({ players: [alice, bob] }); // round resets
    rerender({ players: [{ ...alice, isYanivCalled: true }, bob] }); // calls again next round

    expect(toast.info).toHaveBeenCalledTimes(2);
    expect(toast.info).toHaveBeenCalledWith('Alice has called Yaniv!');
  });

  test('fires toasts for multiple players calling Yaniv at the same time', () => {
    const { rerender } = renderHook(
      ({ players }) => useYanivCalledToast(players),
      { initialProps: { players: [alice, bob] } },
    );

    rerender({
      players: [
        { ...alice, isYanivCalled: true },
        { ...bob, isYanivCalled: true },
      ],
    });

    expect(toast.info).toHaveBeenCalledTimes(2);
    expect(toast.info).toHaveBeenCalledWith('Alice has called Yaniv!');
    expect(toast.info).toHaveBeenCalledWith('Bob has called Yaniv!');
  });
});
