import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { PlayerName, UserId } from '~/types/entities';
import type { GameCode, Player } from '~/types/game';
import {
  type DealerSetting,
  type HandSizeSetting,
  type Settings,
  type SettingUpdate,
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

// Variables of the settings saves still in progress, oldest first
let pendingSettingsVariables: unknown[] = [];

vi.mock('@tanstack/react-query', () => ({
  useMutationState: () => pendingSettingsVariables,
}));
vi.mock('@trpc/react-query', () => ({
  getMutationKey: () => [['yaniv', 'updateSettings']],
}));

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
    settings: Settings;
    user: { isReady: boolean; name: string };
    handleNameChange: (name: string) => void;
    handleSettingChange: (update: SettingUpdate) => void;
    handleReadyChange: (isReady: boolean) => void;
  }) => (
    <div>
      <p>Hand size: {props.settings.handSize}</p>
      <p>Dealer: {props.settings.dealer}</p>
      <button
        type='button'
        onClick={() => props.handleSettingChange({ dealer: 'hand-winner' })}
      >
        Hand winner deals
      </button>
      <p>Ready: {String(props.user.isReady)}</p>
      <input
        aria-label='Your name'
        value={props.user.name}
        onChange={(event) => props.handleNameChange(event.target.value)}
      />
      <button
        type='button'
        onClick={() => props.handleSettingChange({ handSize: 5 })}
      >
        Choose 5
      </button>
      <button
        type='button'
        onClick={() => props.handleSettingChange({ handSize: 7 })}
      >
        Choose 7
      </button>
      <button
        type='button'
        onClick={() =>
          props.handleSettingChange({ handSize: WINNER_CHOOSES_HAND_SIZE })
        }
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

const code = 'ABCDEF' as GameCode;

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
  handSize = 5,
  dealer = 'rotates',
  isReady = false,
}: {
  handSize?: HandSizeSetting;
  dealer?: DealerSetting;
  isReady?: boolean;
} = {}) =>
  render(
    <Lobby
      code={code}
      players={[player({ isReady })]}
      settings={{ handSize, dealer }}
    />,
  );

beforeEach(() => {
  vi.clearAllMocks();
  pendingSettingsVariables = [];
  for (const mutation of [readyMutation, settingsMutation, otherMutation]) {
    mutation.isPending = false;
    mutation.variables = undefined;
  }
});

describe('Lobby', () => {
  describe('hand size', () => {
    test('shows the hand size the lobby is on', () => {
      renderLobby({ handSize: 7 });

      expect(screen.getByText('Hand size: 7')).toBeInTheDocument();
    });

    test('saves the hand size that was chosen', () => {
      renderLobby({ handSize: 5 });

      fireEvent.click(screen.getByRole('button', { name: 'Choose 7' }));

      expect(settingsMutation.mutate).toHaveBeenCalledOnce();
      expect(settingsMutation.mutate).toHaveBeenCalledWith({
        code,
        settings: { handSize: 7 },
      });
    });

    test('saves that the winner chooses the hand size', () => {
      renderLobby({ handSize: 5 });

      fireEvent.click(
        screen.getByRole('button', { name: 'Let the winner choose' }),
      );

      expect(settingsMutation.mutate).toHaveBeenCalledOnce();
      expect(settingsMutation.mutate).toHaveBeenCalledWith({
        code,
        settings: { handSize: WINNER_CHOOSES_HAND_SIZE },
      });
    });

    test('shows the chosen hand size while it is still being saved', () => {
      pendingSettingsVariables = [{ code, settings: { handSize: 7 } }];

      renderLobby({ handSize: 5 });

      expect(screen.getByText('Hand size: 7')).toBeInTheDocument();
    });

    test('shows the lobby hand size again once the change has been saved', () => {
      renderLobby({ handSize: 5 });

      expect(screen.getByText('Hand size: 5')).toBeInTheDocument();
    });

    test('shows the latest hand size chosen while several are being saved', () => {
      pendingSettingsVariables = [
        { code, settings: { handSize: 7 } },
        { code, settings: { handSize: WINNER_CHOOSES_HAND_SIZE } },
      ];

      renderLobby({ handSize: 5 });

      expect(
        screen.getByText(`Hand size: ${WINNER_CHOOSES_HAND_SIZE}`),
      ).toBeInTheDocument();
    });

    test('ignores a hand size being saved for another lobby', () => {
      pendingSettingsVariables = [
        { code: 'UVWXYZ' as GameCode, settings: { handSize: 7 } },
      ];

      renderLobby({ handSize: 5 });

      expect(screen.getByText('Hand size: 5')).toBeInTheDocument();
    });
  });

  describe('dealer', () => {
    test('shows the dealer the lobby is on', () => {
      renderLobby({ dealer: 'hand-winner' });

      expect(screen.getByText('Dealer: hand-winner')).toBeInTheDocument();
    });

    test('saves the dealer that was chosen', () => {
      renderLobby();

      fireEvent.click(
        screen.getByRole('button', { name: 'Hand winner deals' }),
      );

      expect(settingsMutation.mutate).toHaveBeenCalledOnce();
      expect(settingsMutation.mutate).toHaveBeenCalledWith({
        code,
        settings: { dealer: 'hand-winner' },
      });
    });

    test('shows the chosen dealer while it is still being saved', () => {
      pendingSettingsVariables = [
        { code, settings: { dealer: 'hand-winner' } },
      ];

      renderLobby({ dealer: 'rotates' });

      expect(screen.getByText('Dealer: hand-winner')).toBeInTheDocument();
    });

    test('shows both choices while the hand size and dealer are being saved', () => {
      pendingSettingsVariables = [
        { code, settings: { handSize: 7 } },
        { code, settings: { dealer: 'hand-winner' } },
      ];

      renderLobby({ handSize: 5, dealer: 'rotates' });

      expect(screen.getByText('Hand size: 7')).toBeInTheDocument();
      expect(screen.getByText('Dealer: hand-winner')).toBeInTheDocument();
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
