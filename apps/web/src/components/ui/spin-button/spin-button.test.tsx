import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SpinButton } from '.';

const renderSpinButton = ({
  value = 5,
  onValueChange = vi.fn(),
}: {
  value?: number;
  onValueChange?: (value: number) => void;
} = {}) =>
  render(
    <SpinButton
      label='Min'
      value={value}
      min={1}
      max={10}
      onValueChange={onValueChange}
    />,
  );

describe('SpinButton', () => {
  it('names the value with its label', () => {
    renderSpinButton();

    expect(screen.getByRole('spinbutton', { name: 'Min' })).toHaveAttribute(
      'aria-valuenow',
      '5',
    );
  });

  describe('keyboard', () => {
    it.each([
      ['ArrowUp', 6],
      ['ArrowDown', 4],
      ['Home', 1],
      ['End', 10],
    ])('changes the value with %s', (key, expectedValue) => {
      const onValueChange = vi.fn();
      renderSpinButton({ onValueChange });

      fireEvent.keyDown(screen.getByRole('spinbutton'), { key });

      expect(onValueChange).toHaveBeenCalledExactlyOnceWith(expectedValue);
    });

    it('does not go past the maximum', () => {
      const onValueChange = vi.fn();
      renderSpinButton({ value: 10, onValueChange });

      fireEvent.keyDown(screen.getByRole('spinbutton'), { key: 'ArrowUp' });

      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('does not go below the minimum', () => {
      const onValueChange = vi.fn();
      renderSpinButton({ value: 1, onValueChange });

      fireEvent.keyDown(screen.getByRole('spinbutton'), { key: 'ArrowDown' });

      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  describe('buttons', () => {
    it('increases the value', () => {
      const onValueChange = vi.fn();
      renderSpinButton({ onValueChange });

      fireEvent.click(screen.getByRole('button', { name: 'Increase Min' }));

      expect(onValueChange).toHaveBeenCalledExactlyOnceWith(6);
    });

    it('decreases the value', () => {
      const onValueChange = vi.fn();
      renderSpinButton({ onValueChange });

      fireEvent.click(screen.getByRole('button', { name: 'Decrease Min' }));

      expect(onValueChange).toHaveBeenCalledExactlyOnceWith(4);
    });

    it('moves focus to the value', () => {
      renderSpinButton();

      fireEvent.click(screen.getByRole('button', { name: 'Increase Min' }));

      expect(screen.getByRole('spinbutton')).toHaveFocus();
    });

    it('disables decreasing at the minimum', () => {
      renderSpinButton({ value: 1 });

      expect(
        screen.getByRole('button', { name: 'Decrease Min' }),
      ).toBeDisabled();
    });

    it('disables increasing at the maximum', () => {
      renderSpinButton({ value: 10 });

      expect(
        screen.getByRole('button', { name: 'Increase Min' }),
      ).toBeDisabled();
    });
  });
});
