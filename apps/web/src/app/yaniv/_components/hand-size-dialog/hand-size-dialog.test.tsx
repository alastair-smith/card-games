import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { HandSizeDialog } from '.';

const noop = vi.fn();

const openDialog = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Choose hand size' }));

describe('HandSizeDialog', () => {
  test('opens to choose the hand size', () => {
    render(<HandSizeDialog isDealer onChooseHandSize={noop} />);
    openDialog();
    expect(
      screen.getByRole('dialog', { name: 'Choose the hand size' }),
    ).toBeInTheDocument();
  });

  describe('when you deal the next round', () => {
    test('deals the chosen number of cards', () => {
      const handleChooseHandSize = vi.fn();
      render(
        <HandSizeDialog isDealer onChooseHandSize={handleChooseHandSize} />,
      );
      openDialog();

      fireEvent.keyDown(screen.getByRole('slider', { name: 'Hand size' }), {
        key: 'ArrowRight',
      });
      fireEvent.click(screen.getByRole('button', { name: 'Deal 6 cards' }));

      expect(handleChooseHandSize).toHaveBeenCalledOnce();
      expect(handleChooseHandSize).toHaveBeenCalledWith(6);
    });

    test('stays open after choosing, until the round is dealt', () => {
      render(<HandSizeDialog isDealer onChooseHandSize={noop} />);
      openDialog();

      fireEvent.click(screen.getByRole('button', { name: 'Deal 5 cards' }));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    test('cannot choose again while the choice is being sent', () => {
      const handleChooseHandSize = vi.fn();
      render(
        <HandSizeDialog
          isDealer
          isPending
          onChooseHandSize={handleChooseHandSize}
        />,
      );
      openDialog();

      const dealButton = screen.getByRole('button', { name: 'Deal 5 cards' });
      fireEvent.click(dealButton);

      expect(dealButton).toBeDisabled();
      expect(handleChooseHandSize).not.toHaveBeenCalled();
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
      openDialog();

      fireEvent.click(screen.getByRole('button', { name: 'Choose 5 cards' }));

      expect(handleChooseHandSize).toHaveBeenCalledWith(5);
    });
  });

  describe('hand size', () => {
    test('starts at five cards from one to ten', () => {
      render(<HandSizeDialog isDealer onChooseHandSize={noop} />);
      openDialog();

      const slider = screen.getByRole('slider', { name: 'Hand size' });
      expect(slider).toHaveValue('5');
      expect(slider).toHaveAttribute('min', '1');
      expect(slider).toHaveAttribute('max', '10');
    });

    test('says card rather than cards for a single card', () => {
      render(<HandSizeDialog isDealer onChooseHandSize={noop} />);
      openDialog();

      fireEvent.keyDown(screen.getByRole('slider', { name: 'Hand size' }), {
        key: 'Home',
      });

      expect(
        screen.getByRole('button', { name: 'Deal 1 card' }),
      ).toBeInTheDocument();
    });

    test('starts at five cards again when reopened', () => {
      render(<HandSizeDialog isDealer onChooseHandSize={noop} />);
      openDialog();
      fireEvent.keyDown(screen.getByRole('slider', { name: 'Hand size' }), {
        key: 'End',
      });
      fireEvent.click(screen.getByRole('button', { name: 'Close' }));

      openDialog();

      expect(screen.getByRole('slider', { name: 'Hand size' })).toHaveValue(
        '5',
      );
    });
  });
});
