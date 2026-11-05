import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Range } from '.';

const renderRange = (onRangeChange = vi.fn(), isDisabled = false) =>
  render(
    <Range
      label='Hand size'
      min={1}
      max={10}
      range={[3, 6]}
      isDisabled={isDisabled}
      onRangeChange={onRangeChange}
    />,
  );

describe('Range', () => {
  it('names the group with its label', () => {
    renderRange();

    expect(
      screen.getByRole('group', { name: 'Hand size' }),
    ).toBeInTheDocument();
  });

  describe('lower end', () => {
    it('changes the lower end', () => {
      const onRangeChange = vi.fn();
      renderRange(onRangeChange);

      fireEvent.keyDown(screen.getByRole('spinbutton', { name: 'Min' }), {
        key: 'ArrowDown',
      });

      expect(onRangeChange).toHaveBeenCalledExactlyOnceWith([2, 6]);
    });

    it('goes no higher than the upper end', () => {
      renderRange();

      expect(screen.getByRole('spinbutton', { name: 'Min' })).toHaveAttribute(
        'aria-valuemax',
        '6',
      );
    });
  });

  describe('upper end', () => {
    it('changes the upper end', () => {
      const onRangeChange = vi.fn();
      renderRange(onRangeChange);

      fireEvent.keyDown(screen.getByRole('spinbutton', { name: 'Max' }), {
        key: 'ArrowUp',
      });

      expect(onRangeChange).toHaveBeenCalledExactlyOnceWith([3, 7]);
    });

    it('goes no lower than the lower end', () => {
      renderRange();

      expect(screen.getByRole('spinbutton', { name: 'Max' })).toHaveAttribute(
        'aria-valuemin',
        '3',
      );
    });
  });

  describe('when disabled', () => {
    it('disables the group and both ends', () => {
      renderRange(vi.fn(), true);

      expect(screen.getByRole('group', { name: 'Hand size' })).toBeDisabled();
      for (const name of ['Min', 'Max']) {
        expect(screen.getByRole('spinbutton', { name })).toHaveAttribute(
          'aria-disabled',
          'true',
        );
      }
    });

    it('does not change the range', () => {
      const onRangeChange = vi.fn();
      renderRange(onRangeChange, true);

      fireEvent.keyDown(screen.getByRole('spinbutton', { name: 'Max' }), {
        key: 'ArrowUp',
      });

      expect(onRangeChange).not.toHaveBeenCalled();
    });
  });
});
