import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { PlayerName, UserId } from '~/types/entities';
import type { GameCode, Player } from '~/types/game';
import {
  DEFAULT_SETTINGS,
  type HandSizeRange,
  type HandSizeSetting,
  RANDOM_HAND_SIZE,
  type Settings,
  WINNER_CHOOSES_HAND_SIZE,
} from '~/types/games/yaniv';
import type { PlayerColor } from '~/utils/player-color';
import Lobby from './index';

vi.mock('~/components/ui/toast', () => ({
  toast: { info: vi.fn(), error: vi.fn(), success: vi.fn() },
}));

type MutationStub = {
  mutate: ReturnType<typeof vi.fn>;
  mutateAsync: ReturnType<typeof vi.fn>;
  isPending: boolean;
  variables: unknown;
};

const createMutationStub = (): MutationStub => ({
  mutate: vi.fn(),
  mutateAsync: vi.fn().mockResolvedValue(undefined),
  isPending: false,
  variables: undefined,
});

const readyMutation = createMutationStub();
const settingsMutation = createMutationStub();
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
    yaniv: {
      startGame: { useMutation: () => otherMutation },
      updateSettings: { useMutation: () => settingsMutation },
    },
  },
}));

vi.mock('./lobby.view', () => ({
  default: (props: {
    handSize: HandSizeSetting;
    handSizeRange: HandSizeRange;
    user: { isReady: boolean; name: string };
    handleNameChange: (name: string) => void;
    handleHandSizeChange: (handSize: HandSizeSetting) => void;
    handleHandSizeRangeChange: (handSizeRange: HandSizeRange) => void;
    handleReadyChange: (isReady: boolean) => void;
  }) => (
    <div>
      <p>Hand size: {props.handSize}</p>
      <p>
        Range: {props.handSizeRange.min} to {props.handSizeRange.max}
      </p>
      <button
        type='button'
        onClick={() => props.handleHandSizeRangeChange({ min: 2, max: 7 })}
      >
        Raise the fewest cards
      </button>
      <p>Ready: {String(props.user.isReady)}</p>
      <input
        aria-label='Your name'
        value={props.user.name}
        onChange={(event) => props.handleNameChange(event.target.value)}
      />
      <button type='button' onClick={() => props.handleHandSizeChange(5)}>
        Choose 5
      </button>
      <button type='button' onClick={() => props.handleHandSizeChange(7)}>
        Choose 7
      </button>
      <button
        type='button'
        onClick={() => props.handleHandSizeChange(WINNER_CHOOSES_HAND_SIZE)}
      >
        Let the winner choose
      </button>
      <button type='button' onClick={() => props.handleReadyChange(true)}>
        Ready up
      </button>
      <button type='button' onClick={() => props.handleReadyChange(false)}>
        Stand down
      </button>
    </div>
  ),
}));

const code = 'ABCD' as GameCode;

const player = (overrides: Partial<Player> = {}): Player => ({
  id: 'player-1' as UserId,
  name: 'Ada' as PlayerName,
  color: 'red' as PlayerColor,
  isReady: false,
  isUser: true,
  isHost: true,
  ...overrides,
});

const renderLobby = ({
  settings = {},
  isReady = false,
}: {
  settings?: Partial<Settings>;
  isReady?: boolean;
} = {}) =>
  render(
    <Lobby
      code={code}
      players={[player({ isReady })]}
      settings={{ ...DEFAULT_SETTINGS, ...settings }}
    />,
  );

beforeEach(() => {
  vi.clearAllMocks();
  for (const mutation of [readyMutation, settingsMutation, otherMutation]) {
    mutation.isPending = false;
    mutation.variables = undefined;
  }
});

describe('Lobby', () => {
  describe('hand size', () => {
    test('shows the hand size the lobby is on', () => {
      renderLobby({ settings: { handSize: 7 } });

      expect(screen.getByText('Hand size: 7')).toBeInTheDocument();
    });

    test('saves the hand size that was chosen, keeping the range', () => {
      renderLobby({ settings: { handSize: 5 } });

      fireEvent.click(screen.getByRole('button', { name: 'Choose 7' }));

      expect(settingsMutation.mutate).toHaveBeenCalledOnce();
      expect(settingsMutation.mutate).toHaveBeenCalledWith({
        code,
        settings: { ...DEFAULT_SETTINGS, handSize: 7 },
      });
    });

    test('saves that the winner chooses the hand size', () => {
      renderLobby({ settings: { handSize: 5 } });

      fireEvent.click(
        screen.getByRole('button', { name: 'Let the winner choose' }),
      );

      expect(settingsMutation.mutate).toHaveBeenCalledOnce();
      expect(settingsMutation.mutate).toHaveBeenCalledWith({
        code,
        settings: { ...DEFAULT_SETTINGS, handSize: WINNER_CHOOSES_HAND_SIZE },
      });
    });

    test('shows the chosen hand size while it is still being saved', () => {
      settingsMutation.isPending = true;
      settingsMutation.variables = {
        code,
        settings: { ...DEFAULT_SETTINGS, handSize: 7 },
      };

      renderLobby({ settings: { handSize: 5 } });

      expect(screen.getByText('Hand size: 7')).toBeInTheDocument();
    });

    test('shows the lobby hand size again once the change has been saved', () => {
      settingsMutation.isPending = false;
      settingsMutation.variables = {
        code,
        settings: { ...DEFAULT_SETTINGS, handSize: 7 },
      };

      renderLobby({ settings: { handSize: 5 } });

      expect(screen.getByText('Hand size: 5')).toBeInTheDocument();
    });
  });

  describe('random hand size range', () => {
    test('shows the range the lobby is on', () => {
      renderLobby({ settings: { handSizeRange: { min: 3, max: 6 } } });

      expect(screen.getByText('Range: 3 to 6')).toBeInTheDocument();
    });

    test('saves each change to the range straight away, keeping the hand size', () => {
      renderLobby({ settings: { handSize: RANDOM_HAND_SIZE } });

      fireEvent.click(
        screen.getByRole('button', { name: 'Raise the fewest cards' }),
      );

      expect(settingsMutation.mutate).toHaveBeenCalledOnce();
      expect(settingsMutation.mutate).toHaveBeenCalledWith({
        code,
        settings: {
          handSize: RANDOM_HAND_SIZE,
          handSizeRange: { min: 2, max: 7 },
        },
      });
    });

    test('builds on a change that is still being saved', () => {
      settingsMutation.isPending = true;
      settingsMutation.variables = {
        code,
        settings: { ...DEFAULT_SETTINGS, handSize: RANDOM_HAND_SIZE },
      };
      renderLobby({ settings: { handSize: 5 } });

      fireEvent.click(
        screen.getByRole('button', { name: 'Raise the fewest cards' }),
      );

      expect(settingsMutation.mutate).toHaveBeenCalledWith({
        code,
        settings: {
          handSize: RANDOM_HAND_SIZE,
          handSizeRange: { min: 2, max: 7 },
        },
      });
    });

    test('shows the chosen range while it is still being saved', () => {
      settingsMutation.isPending = true;
      settingsMutation.variables = {
        code,
        settings: { ...DEFAULT_SETTINGS, handSizeRange: { min: 4, max: 9 } },
      };

      renderLobby();

      expect(screen.getByText('Range: 4 to 9')).toBeInTheDocument();
    });
  });

  describe('readiness', () => {
    test('shows the readiness the lobby has for the player', () => {
      renderLobby({ isReady: true });

      expect(screen.getByText('Ready: true')).toBeInTheDocument();
    });

    test('saves the readiness that was chosen', () => {
      renderLobby({ isReady: false });

      fireEvent.click(screen.getByRole('button', { name: 'Ready up' }));

      expect(readyMutation.mutate).toHaveBeenCalledOnce();
      expect(readyMutation.mutate).toHaveBeenCalledWith({
        field: 'isReady',
        code,
        isReady: true,
      });
    });

    test('shows the chosen readiness while it is still being saved', () => {
      readyMutation.isPending = true;
      readyMutation.variables = { field: 'isReady', code, isReady: true };

      renderLobby({ isReady: false });

      expect(screen.getByText('Ready: true')).toBeInTheDocument();
    });

    test('shows standing down while it is still being saved', () => {
      readyMutation.isPending = true;
      readyMutation.variables = { field: 'isReady', code, isReady: false };

      renderLobby({ isReady: true });

      expect(screen.getByText('Ready: false')).toBeInTheDocument();
    });

    test('shows the lobby readiness again once the change has been saved', () => {
      readyMutation.isPending = false;
      readyMutation.variables = { field: 'isReady', code, isReady: true };

      renderLobby({ isReady: false });

      expect(screen.getByText('Ready: false')).toBeInTheDocument();
    });

    test('ignores a name change that is still being saved', () => {
      readyMutation.isPending = true;
      readyMutation.variables = { field: 'name', code, playerName: 'Grace' };

      renderLobby({ isReady: true });

      expect(screen.getByText('Ready: true')).toBeInTheDocument();
    });
  });

  describe('name', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    const changeName = (name: string) =>
      fireEvent.change(screen.getByRole('textbox', { name: 'Your name' }), {
        target: { value: name },
      });

    test('saves the name once typing has paused', () => {
      renderLobby();

      changeName('Grace');
      vi.runAllTimers();

      expect(otherMutation.mutate).toHaveBeenCalledOnce();
      expect(otherMutation.mutate).toHaveBeenCalledWith(
        { field: 'name', code, playerName: 'Grace' },
        expect.anything(),
      );
    });

    test('does not save an empty name', () => {
      renderLobby();

      changeName('');
      vi.runAllTimers();

      expect(otherMutation.mutate).not.toHaveBeenCalled();
    });

    test('does not save a name that was cleared before it was saved', () => {
      renderLobby();

      changeName('G');
      changeName('');
      vi.runAllTimers();

      expect(otherMutation.mutate).not.toHaveBeenCalled();
    });
  });
});
