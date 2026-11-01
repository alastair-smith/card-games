import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { HandSizeDialog } from '.';

const noop = vi.fn();

const openDialog = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Choose hand size' }));

const getHandSize = (name: string) =>
  within(screen.getByRole('radiogroup', { name: 'Hand size' })).getByRole(
    'radio',
    { name },
  );

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

      fireEvent.click(getHandSize('6'));
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
    test('offers one to ten cards, starting at five', () => {
      render(<HandSizeDialog isDealer onChooseHandSize={noop} />);
      openDialog();

      const handSizes = within(
        screen.getByRole('radiogroup', { name: 'Hand size' }),
      ).getAllByRole('radio');
      expect(handSizes.map((handSize) => handSize.textContent)).toEqual([
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
      ]);
      expect(getHandSize('5')).toBeChecked();
    });

    test('says card rather than cards for a single card', () => {
      render(<HandSizeDialog isDealer onChooseHandSize={noop} />);
      openDialog();

      fireEvent.click(getHandSize('1'));

      expect(
        screen.getByRole('button', { name: 'Deal 1 card' }),
      ).toBeInTheDocument();
    });

    test('starts at five cards again when reopened', () => {
      render(<HandSizeDialog isDealer onChooseHandSize={noop} />);
      openDialog();
      fireEvent.click(getHandSize('10'));
      fireEvent.click(screen.getByRole('button', { name: 'Close' }));

      openDialog();

      expect(getHandSize('5')).toBeChecked();
    });
  });
});
