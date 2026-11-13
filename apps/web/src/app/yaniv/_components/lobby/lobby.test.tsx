import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { buildPlayer } from '~/test-utils/lobby';
import type { GameCode } from '~/types/game';
import {
  type DealerSetting,
  type HandSizeSetting,
  type Settings,
  type SettingUpdate,
  WINNER_CHOOSES_HAND_SIZE,
} from '~/types/games/yaniv';
import Lobby from './index';

vi.mock('~/components/ui/toast', () => ({
  toast: { info: vi.fn(), error: vi.fn(), success: vi.fn() },
}));

vi.mock('~/components/lobby/use-lobby-player', () => ({
  useLobbyPlayer: () => ({
    user: { isReady: false, name: 'Ada', nameError: '', color: 'red' },
  }),
}));

const settingsMutation = { mutate: vi.fn() };
const startGameMutation = { mutate: vi.fn() };

// Variables of the settings saves still in progress, oldest first
let pendingSettingsVariables: unknown[] = [];
let mutationStateOptions: unknown;

vi.mock('@tanstack/react-query', () => ({
  useMutationState: (options: unknown) => {
    mutationStateOptions = options;
    return pendingSettingsVariables;
  },
}));
vi.mock('@trpc/react-query', () => ({
  getMutationKey: () => [['yaniv', 'updateSettings']],
}));

vi.mock('~/trpc/react', () => ({
  api: {
    yaniv: {
      startGame: { useMutation: () => startGameMutation },
      updateSettings: { useMutation: () => settingsMutation },
    },
  },
}));

vi.mock('./lobby.view', () => ({
  default: (props: {
    settings: Settings;
    onSettingChange: (update: SettingUpdate) => void;
    onStartGame: () => void;
  }) => (
    <div>
      <p>Hand size: {props.settings.handSize}</p>
      <p>Dealer: {props.settings.dealer}</p>
      <button
        type='button'
        onClick={() => props.onSettingChange({ dealer: 'hand-winner' })}
      >
        Hand winner deals
      </button>
      <button
        type='button'
        onClick={() => props.onSettingChange({ handSize: 5 })}
      >
        Choose 5
      </button>
      <button
        type='button'
        onClick={() => props.onSettingChange({ handSize: 7 })}
      >
        Choose 7
      </button>
      <button
        type='button'
        onClick={() =>
          props.onSettingChange({ handSize: WINNER_CHOOSES_HAND_SIZE })
        }
      >
        Let the winner choose
      </button>
      <button type='button' onClick={props.onStartGame}>
        Start Game
      </button>
    </div>
  ),
}));

const code = 'ABCDEF' as GameCode;

const renderLobby = ({
  handSize = 5,
  dealer = 'rotates',
}: {
  handSize?: HandSizeSetting;
  dealer?: DealerSetting;
} = {}) =>
  render(
    <Lobby
      code={code}
      players={[buildPlayer({ isUser: true, isHost: true })]}
      settings={{ handSize, dealer }}
    />,
  );

beforeEach(() => {
  settingsMutation.mutate = vi.fn();
  startGameMutation.mutate = vi.fn();
  pendingSettingsVariables = [];
  mutationStateOptions = undefined;
});

describe('Lobby', () => {
  test('starts the game for this lobby', () => {
    renderLobby();

    fireEvent.click(screen.getByRole('button', { name: 'Start Game' }));

    expect(startGameMutation.mutate).toHaveBeenCalledOnce();
    expect(startGameMutation.mutate).toHaveBeenCalledWith({ code });
  });

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

    test('only shows settings saves that are still in progress', () => {
      renderLobby();

      expect(mutationStateOptions).toMatchObject({
        filters: {
          mutationKey: [['yaniv', 'updateSettings']],
          status: 'pending',
        },
      });
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
});
