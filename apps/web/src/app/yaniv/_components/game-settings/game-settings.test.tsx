import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import {
  DEFAULT_HAND_SIZE_RANGE,
  RANDOM_HAND_SIZE,
  WINNER_CHOOSES_HAND_SIZE,
} from '~/types/games/yaniv';
import GameSettings from '.';

const noop = vi.fn();

const defaultProps = {
  handSize: 5 as const,
  handSizeRange: DEFAULT_HAND_SIZE_RANGE,
  isHost: true,
  onHandSizeChange: noop,
  onHandSizeRangeChange: noop,
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
      expect(handleHandSizeChange).toHaveBeenCalledWith(7);
    });

    test('offers to let the winner of each hand choose', () => {
      const handleHandSizeChange = vi.fn();
      render(
        <GameSettings
          {...defaultProps}
          onHandSizeChange={handleHandSizeChange}
        />,
      );

      fireEvent.click(screen.getByRole('radio', { name: /Winner Chooses/ }));

      expect(handleHandSizeChange).toHaveBeenCalledOnce();
      expect(handleHandSizeChange).toHaveBeenCalledWith(
        WINNER_CHOOSES_HAND_SIZE,
      );
    });

    test('shows the winner choosing as selected', () => {
      render(
        <GameSettings {...defaultProps} handSize={WINNER_CHOOSES_HAND_SIZE} />,
      );
      expect(
        screen.getByRole('radio', { name: /Winner Chooses/ }),
      ).toBeChecked();
    });

    test('offers a random hand size', () => {
      const handleHandSizeChange = vi.fn();
      render(
        <GameSettings
          {...defaultProps}
          onHandSizeChange={handleHandSizeChange}
        />,
      );

      fireEvent.click(screen.getByRole('radio', { name: /Random/ }));

      expect(handleHandSizeChange).toHaveBeenCalledOnce();
      expect(handleHandSizeChange).toHaveBeenCalledWith(RANDOM_HAND_SIZE);
    });
  });

  describe('random hand size range', () => {
    // Includes hidden elements, as a closed panel is hidden from screen readers
    const getRangePanel = () =>
      screen
        .getByRole('group', { name: 'Hand size range', hidden: true })
        .closest('[data-slot="choice-card-panel"]');

    test('is out of reach until a random hand size is chosen', () => {
      render(<GameSettings {...defaultProps} />);

      expect(getRangePanel()).toHaveAttribute('inert');
      expect(
        screen.queryByRole('group', { name: 'Hand size range' }),
      ).not.toBeInTheDocument();
    });

    test('opens the range below the random choice when the hand size is random', () => {
      render(
        <GameSettings
          {...defaultProps}
          handSize={RANDOM_HAND_SIZE}
          handSizeRange={{ min: 3, max: 6 }}
        />,
      );

      expect(getRangePanel()).not.toHaveAttribute('inert');
      expect(
        screen
          .getByRole('radio', { name: /Random/ })
          .closest('[data-slot="choice-card"]'),
      ).toContainElement(
        screen.getByRole('group', { name: 'Hand size range' }),
      );
      expect(screen.getByRole('spinbutton', { name: 'Min' })).toHaveAttribute(
        'aria-valuenow',
        '3',
      );
      expect(screen.getByRole('spinbutton', { name: 'Max' })).toHaveAttribute(
        'aria-valuenow',
        '6',
      );
    });

    test('calls the range handler when an end of the range changes', () => {
      const handleHandSizeRangeChange = vi.fn();
      render(
        <GameSettings
          {...defaultProps}
          handSize={RANDOM_HAND_SIZE}
          handSizeRange={{ min: 3, max: 6 }}
          onHandSizeRangeChange={handleHandSizeRangeChange}
        />,
      );

      fireEvent.click(screen.getByRole('button', { name: 'Increase Max' }));

      expect(handleHandSizeRangeChange).toHaveBeenCalledOnce();
      expect(handleHandSizeRangeChange).toHaveBeenCalledWith({
        min: 3,
        max: 7,
      });
    });
  });

  describe('players who are not the host', () => {
    test('cannot change the random hand size range', () => {
      render(
        <GameSettings
          {...defaultProps}
          handSize={RANDOM_HAND_SIZE}
          isHost={false}
        />,
      );

      expect(
        screen.getByRole('group', { name: 'Hand size range' }),
      ).toBeDisabled();
    });

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
