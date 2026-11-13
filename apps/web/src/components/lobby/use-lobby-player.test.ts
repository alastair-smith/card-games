import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { buildPlayer } from '~/test-utils/lobby';
import type { GameCode } from '~/types/game';
import { useLobbyPlayer } from './use-lobby-player';

vi.mock('~/components/ui/toast', () => ({
  toast: { info: vi.fn(), error: vi.fn(), success: vi.fn() },
}));

type MutationStub = {
  mutate: ReturnType<typeof vi.fn>;
  isPending: boolean;
  variables: unknown;
};

const createMutationStub = (): MutationStub => ({
  mutate: vi.fn(),
  isPending: false,
  variables: undefined,
});

const readyMutation = createMutationStub();
const otherMutation = createMutationStub();

vi.mock('~/trpc/react', () => ({
  api: {
    lobby: {
      updatePlayer: {
        useMutation: (options?: { scope?: { id: string } }) =>
          options?.scope ? readyMutation : otherMutation,
      },
      leaveGame: { useMutation: () => otherMutation },
      kickPlayer: { useMutation: () => otherMutation },
      makeHost: { useMutation: () => otherMutation },
    },
  },
}));

const code = 'ABCDEF' as GameCode;

const renderLobbyPlayer = ({ isReady = false }: { isReady?: boolean } = {}) =>
  renderHook(() =>
    useLobbyPlayer({
      code,
      players: [buildPlayer({ isUser: true, isHost: true, isReady })],
    }),
  );

beforeEach(() => {
  for (const mutation of [readyMutation, otherMutation]) {
    mutation.mutate = vi.fn();
    mutation.isPending = false;
    mutation.variables = undefined;
  }
});

describe('useLobbyPlayer', () => {
  test('throws when the user is not in the lobby', () => {
    expect(() =>
      renderHook(() => useLobbyPlayer({ code, players: [buildPlayer()] })),
    ).toThrow('Current player not found in lobby');
  });

  describe('readiness', () => {
    test('gives the readiness the lobby has for the player', () => {
      const { result } = renderLobbyPlayer({ isReady: true });

      expect(result.current.user.isReady).toBe(true);
    });

    test('saves the readiness that was chosen', () => {
      const { result } = renderLobbyPlayer({ isReady: false });

      act(() => result.current.handleReadyChange(true));

      expect(readyMutation.mutate).toHaveBeenCalledOnce();
      expect(readyMutation.mutate).toHaveBeenCalledWith({
        field: 'isReady',
        code,
        isReady: true,
      });
    });

    test('gives the chosen readiness while it is still being saved', () => {
      readyMutation.isPending = true;
      readyMutation.variables = { field: 'isReady', code, isReady: true };

      const { result } = renderLobbyPlayer({ isReady: false });

      expect(result.current.user.isReady).toBe(true);
    });

    test('gives standing down while it is still being saved', () => {
      readyMutation.isPending = true;
      readyMutation.variables = { field: 'isReady', code, isReady: false };

      const { result } = renderLobbyPlayer({ isReady: true });

      expect(result.current.user.isReady).toBe(false);
    });

    test('gives the lobby readiness again once the change has been saved', () => {
      readyMutation.variables = { field: 'isReady', code, isReady: true };

      const { result } = renderLobbyPlayer({ isReady: false });

      expect(result.current.user.isReady).toBe(false);
    });

    test('ignores a name change that is still being saved', () => {
      readyMutation.isPending = true;
      readyMutation.variables = { field: 'name', code, playerName: 'Grace' };

      const { result } = renderLobbyPlayer({ isReady: true });

      expect(result.current.user.isReady).toBe(true);
    });
  });

  describe('name', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test('saves the name once typing has paused', () => {
      const { result } = renderLobbyPlayer();

      act(() => result.current.handleNameChange('Grace'));
      vi.runAllTimers();

      expect(otherMutation.mutate).toHaveBeenCalledOnce();
      expect(otherMutation.mutate).toHaveBeenCalledWith(
        { field: 'name', code, playerName: 'Grace' },
        expect.anything(),
      );
    });

    test('gives the name as it is typed', () => {
      const { result } = renderLobbyPlayer();

      act(() => result.current.handleNameChange('Grace'));

      expect(result.current.user.name).toBe('Grace');
    });

    test('does not save an empty name', () => {
      const { result } = renderLobbyPlayer();

      act(() => result.current.handleNameChange(''));
      vi.runAllTimers();

      expect(otherMutation.mutate).not.toHaveBeenCalled();
    });

    test('does not save a name that was cleared before it was saved', () => {
      const { result } = renderLobbyPlayer();

      act(() => result.current.handleNameChange('G'));
      act(() => result.current.handleNameChange(''));
      vi.runAllTimers();

      expect(otherMutation.mutate).not.toHaveBeenCalled();
    });
  });
});
