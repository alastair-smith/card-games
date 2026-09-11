import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { PlayerName, UserId } from '~/types/entities';
import type { GameCode, Player } from '~/types/game';
import type { HandSize } from '~/types/games/yaniv';
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
    handSize: HandSize;
    user: { isReady: boolean };
    handleHandSizeChange: (handSize: string) => void;
    handleReadyChange: (isReady: boolean) => void;
  }) => (
    <div>
      <p>Hand size: {props.handSize}</p>
      <p>Ready: {String(props.user.isReady)}</p>
      <button type='button' onClick={() => props.handleHandSizeChange('5')}>
        Choose 5
      </button>
      <button type='button' onClick={() => props.handleHandSizeChange('7')}>
        Choose 7
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
  handSize = 5 as HandSize,
  isReady = false,
}: {
  handSize?: HandSize;
  isReady?: boolean;
} = {}) =>
  render(
    <Lobby code={code} players={[player({ isReady })]} handSize={handSize} />,
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
      renderLobby({ handSize: 7 as HandSize });

      expect(screen.getByText('Hand size: 7')).toBeInTheDocument();
    });

    test('saves the hand size that was chosen', () => {
      renderLobby({ handSize: 5 as HandSize });

      fireEvent.click(screen.getByRole('button', { name: 'Choose 7' }));

      expect(settingsMutation.mutate).toHaveBeenCalledOnce();
      expect(settingsMutation.mutate).toHaveBeenCalledWith({
        code,
        handSize: 7,
      });
    });

    test('shows the chosen hand size while it is still being saved', () => {
      settingsMutation.isPending = true;
      settingsMutation.variables = { code, handSize: 7 };

      renderLobby({ handSize: 5 as HandSize });

      expect(screen.getByText('Hand size: 7')).toBeInTheDocument();
    });

    test('shows the lobby hand size again once the change has been saved', () => {
      settingsMutation.isPending = false;
      settingsMutation.variables = { code, handSize: 7 };

      renderLobby({ handSize: 5 as HandSize });

      expect(screen.getByText('Hand size: 5')).toBeInTheDocument();
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
});
