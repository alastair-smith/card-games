import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import {
  DEFAULT_SETTINGS,
  settingsSchema,
  WINNER_CHOOSES_HAND_SIZE,
} from '~/types/games/yaniv';
import GameSettings, { GAME_SETTINGS } from '.';

const noop = vi.fn();

const defaultProps = {
  settings: DEFAULT_SETTINGS,
  isHost: true,
  onSettingChange: noop,
};

describe('GameSettings', () => {
  test('shows the settings heading to the host', () => {
    render(<GameSettings {...defaultProps} />);
    expect(
      screen.getByRole('heading', { name: 'Settings' }),
    ).toBeInTheDocument();
  });

  test('offers every setting once', () => {
    const settingKeys = settingsSchema.keyof().options;
    const offeredKeys = GAME_SETTINGS.map((setting) => setting.key);

    expect(offeredKeys).toHaveLength(settingKeys.length);
    expect(offeredKeys).toEqual(expect.arrayContaining(settingKeys));
  });

  describe('hand size', () => {
    test('offers a five and a seven card game', () => {
      render(<GameSettings {...defaultProps} />);
      expect(
        screen.getByRole('radio', { name: /5 Cards/ }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('radio', { name: /7 Cards/ }),
      ).toBeInTheDocument();
    });

    test('shows the chosen hand size as selected', () => {
      render(
        <GameSettings
          {...defaultProps}
          settings={{ ...DEFAULT_SETTINGS, handSize: 7 }}
        />,
      );
      expect(screen.getByRole('radio', { name: /7 Cards/ })).toBeChecked();
      expect(screen.getByRole('radio', { name: /5 Cards/ })).not.toBeChecked();
    });

    test('calls the setting handler when another size is chosen', () => {
      const handleSettingChange = vi.fn();
      render(
        <GameSettings
          {...defaultProps}
          onSettingChange={handleSettingChange}
        />,
      );

      fireEvent.click(screen.getByRole('radio', { name: /7 Cards/ }));

      expect(handleSettingChange).toHaveBeenCalledOnce();
      expect(handleSettingChange).toHaveBeenCalledWith({ handSize: 7 });
    });

    test('offers to let the winner of each hand choose', () => {
      const handleSettingChange = vi.fn();
      render(
        <GameSettings
          {...defaultProps}
          onSettingChange={handleSettingChange}
        />,
      );

      fireEvent.click(screen.getByRole('radio', { name: /Winner Chooses/ }));

      expect(handleSettingChange).toHaveBeenCalledOnce();
      expect(handleSettingChange).toHaveBeenCalledWith({
        handSize: WINNER_CHOOSES_HAND_SIZE,
      });
    });

    test('shows the winner choosing as selected', () => {
      render(
        <GameSettings
          {...defaultProps}
          settings={{ ...DEFAULT_SETTINGS, handSize: WINNER_CHOOSES_HAND_SIZE }}
        />,
      );
      expect(
        screen.getByRole('radio', { name: /Winner Chooses/ }),
      ).toBeChecked();
    });
  });

  describe('dealer', () => {
    test('shows the dealer rotating as selected', () => {
      render(<GameSettings {...defaultProps} />);
      expect(screen.getByRole('radio', { name: /Rotates/ })).toBeChecked();
      expect(
        screen.getByRole('radio', { name: /Hand Winner/ }),
      ).not.toBeChecked();
    });

    test('shows the hand winner dealing as selected', () => {
      render(
        <GameSettings
          {...defaultProps}
          settings={{ ...DEFAULT_SETTINGS, dealer: 'hand-winner' }}
        />,
      );
      expect(screen.getByRole('radio', { name: /Hand Winner/ })).toBeChecked();
    });

    test('calls the setting handler when the hand winner is chosen to deal', () => {
      const handleSettingChange = vi.fn();
      render(
        <GameSettings
          {...defaultProps}
          onSettingChange={handleSettingChange}
        />,
      );

      fireEvent.click(screen.getByRole('radio', { name: /Hand Winner/ }));

      expect(handleSettingChange).toHaveBeenCalledOnce();
      expect(handleSettingChange).toHaveBeenCalledWith({
        dealer: 'hand-winner',
      });
    });
  });

  describe('players who are not the host', () => {
    test('cannot change the dealer', () => {
      render(<GameSettings {...defaultProps} isHost={false} />);

      expect(screen.getByRole('radio', { name: /Rotates/ })).toBeDisabled();
      expect(screen.getByRole('radio', { name: /Hand Winner/ })).toBeDisabled();
    });

    test('cannot change the hand size', () => {
      render(<GameSettings {...defaultProps} isHost={false} />);

      expect(screen.getByRole('radio', { name: /5 Cards/ })).toBeDisabled();
      expect(screen.getByRole('radio', { name: /7 Cards/ })).toBeDisabled();
      expect(
        screen.getByRole('radio', { name: /Winner Chooses/ }),
      ).toBeDisabled();
    });

    test('are told the host configures the settings', () => {
      render(<GameSettings {...defaultProps} isHost={false} />);
      expect(
        screen.getByRole('heading', { name: 'Settings (Configured by Host)' }),
      ).toBeInTheDocument();
    });
  });
});
