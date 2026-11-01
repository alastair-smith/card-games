import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { HandSizeDialog } from '.';

const noop = vi.fn();

const openDialog = (name: string) =>
  fireEvent.click(screen.getByRole('button', { name }));

describe('HandSizeDialog', () => {
  describe('when you deal the next round', () => {
    test('starts the new round from the dialog', () => {
      render(<HandSizeDialog isDealer onChooseHandSize={noop} />);
      openDialog('Start new round');
      expect(
        screen.getByRole('dialog', { name: 'Choose the hand size' }),
      ).toBeInTheDocument();
    });

    test('deals the chosen number of cards', () => {
      const handleChooseHandSize = vi.fn();
      render(
        <HandSizeDialog isDealer onChooseHandSize={handleChooseHandSize} />,
      );
      openDialog('Start new round');

      fireEvent.keyDown(screen.getByRole('slider', { name: 'Hand size' }), {
        key: 'ArrowRight',
      });
      fireEvent.click(screen.getByRole('button', { name: 'Deal 6 cards' }));

      expect(handleChooseHandSize).toHaveBeenCalledOnce();
      expect(handleChooseHandSize).toHaveBeenCalledWith(6);
    });
  });

  describe('when someone else deals the next round', () => {
    test('chooses the hand size for the dealer', () => {
      const handleChooseHandSize = vi.fn();
      render(
        <HandSizeDialog
          isDealer={false}
          onChooseHandSize={handleChooseHandSize}
        />,
      );
      openDialog('Choose hand size');

      fireEvent.click(screen.getByRole('button', { name: 'Choose 5 cards' }));

      expect(handleChooseHandSize).toHaveBeenCalledWith(5);
    });
  });

  describe('hand size', () => {
    test('starts at five cards from one to ten', () => {
      render(<HandSizeDialog isDealer onChooseHandSize={noop} />);
      openDialog('Start new round');

      const slider = screen.getByRole('slider', { name: 'Hand size' });
      expect(slider).toHaveValue('5');
      expect(slider).toHaveAttribute('min', '1');
      expect(slider).toHaveAttribute('max', '10');
    });

    test('says card rather than cards for a single card', () => {
      render(<HandSizeDialog isDealer onChooseHandSize={noop} />);
      openDialog('Start new round');

      fireEvent.keyDown(screen.getByRole('slider', { name: 'Hand size' }), {
        key: 'Home',
      });

      expect(
        screen.getByRole('button', { name: 'Deal 1 card' }),
      ).toBeInTheDocument();
    });

    test('starts at five cards again when reopened', () => {
      render(<HandSizeDialog isDealer onChooseHandSize={noop} />);
      openDialog('Start new round');
      fireEvent.keyDown(screen.getByRole('slider', { name: 'Hand size' }), {
        key: 'End',
      });
      fireEvent.click(screen.getByRole('button', { name: 'Close' }));

      openDialog('Start new round');

      expect(screen.getByRole('slider', { name: 'Hand size' })).toHaveValue(
        '5',
      );
    });
  });
});
