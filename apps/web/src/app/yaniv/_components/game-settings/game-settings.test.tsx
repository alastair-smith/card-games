import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import GameSettings from '.';

const noop = vi.fn();

const defaultProps = {
  handSize: 5 as const,
  isHost: true,
  onHandSizeChange: noop,
};

describe('GameSettings', () => {
  test('shows the settings heading to the host', () => {
    render(<GameSettings {...defaultProps} />);
    expect(
      screen.getByRole('heading', { name: 'Settings' }),
    ).toBeInTheDocument();
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
      render(<GameSettings {...defaultProps} handSize={7} />);
      expect(screen.getByRole('radio', { name: /7 Cards/ })).toBeChecked();
      expect(screen.getByRole('radio', { name: /5 Cards/ })).not.toBeChecked();
    });

    test('calls the hand size handler when another size is chosen', () => {
      const handleHandSizeChange = vi.fn();
      render(
        <GameSettings
          {...defaultProps}
          onHandSizeChange={handleHandSizeChange}
        />,
      );

      fireEvent.click(screen.getByRole('radio', { name: /7 Cards/ }));

      expect(handleHandSizeChange).toHaveBeenCalledOnce();
      expect(handleHandSizeChange).toHaveBeenCalledWith('7');
    });
  });

  describe('players who are not the host', () => {
    test('cannot change the hand size', () => {
      const handleHandSizeChange = vi.fn();
      render(
        <GameSettings
          {...defaultProps}
          isHost={false}
          onHandSizeChange={handleHandSizeChange}
        />,
      );

      fireEvent.click(screen.getByRole('radio', { name: /7 Cards/ }));

      expect(handleHandSizeChange).not.toHaveBeenCalled();
      expect(screen.getByRole('radio', { name: /5 Cards/ })).toBeChecked();
    });

    test('are told the host configures the settings', () => {
      render(<GameSettings {...defaultProps} isHost={false} />);
      expect(
        screen.getByRole('heading', { name: 'Settings (Configured by Host)' }),
      ).toBeInTheDocument();
    });
  });
});
