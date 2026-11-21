import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { buildTableCards } from '~/test-utils/shithead';
import { TableCards } from '.';

describe('TableCards', () => {
  test('describes every card still on the table', () => {
    render(<TableCards slots={buildTableCards()} />);
    expect(
      screen.getByText(
        'Face up: Seven of Hearts, King of Spades, Ten of Diamonds. 3 face down.',
      ),
    ).toBeInTheDocument();
  });

  test('leaves a played face-up card out of the description', () => {
    const [firstSlot, ...otherSlots] = buildTableCards();
    render(
      <TableCards
        slots={[
          { ...firstSlot, faceUpCard: null, hasFaceDownCard: true },
          ...otherSlots,
        ]}
      />,
    );
    expect(
      screen.getByText(
        'Face up: King of Spades, Ten of Diamonds. 3 face down.',
      ),
    ).toBeInTheDocument();
  });

  test('says there are no face-up cards once they have all been played', () => {
    render(
      <TableCards
        slots={buildTableCards().map((slot) => ({
          ...slot,
          faceUpCard: null,
        }))}
      />,
    );
    expect(
      screen.getByText('No face-up cards. 3 face down.'),
    ).toBeInTheDocument();
  });

  test('describes nothing once every card has been played', () => {
    const { container } = render(
      <TableCards
        slots={buildTableCards().map(() => ({
          faceUpCard: null,
          hasFaceDownCard: false,
        }))}
      />,
    );
    expect(container.querySelector('.sr-only')).not.toBeInTheDocument();
  });

  describe('choosing cards', () => {
    test('has no buttons when the cards are only shown', () => {
      render(<TableCards slots={buildTableCards()} />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    test('chooses a face-up card that can be chosen', () => {
      const handleSlotClick = vi.fn();
      render(
        <TableCards
          slots={buildTableCards()}
          selectableSlotIndexes={[1]}
          onSlotClick={handleSlotClick}
        />,
      );

      fireEvent.click(screen.getByRole('button', { name: 'King of Spades' }));

      expect(handleSlotClick).toHaveBeenCalledExactlyOnceWith(1);
    });

    test('leaves out cards that cannot be chosen', () => {
      render(
        <TableCards
          slots={buildTableCards()}
          selectableSlotIndexes={[1]}
          onSlotClick={vi.fn()}
        />,
      );
      expect(screen.getAllByRole('button')).toHaveLength(1);
    });

    test('chooses a face-down card once its face-up card has gone', () => {
      const handleSlotClick = vi.fn();
      render(
        <TableCards
          slots={buildTableCards().map((slot) => ({
            ...slot,
            faceUpCard: null,
          }))}
          selectableSlotIndexes={[0, 1, 2]}
          onSlotClick={handleSlotClick}
        />,
      );

      fireEvent.click(screen.getByRole('button', { name: 'Face-down card 3' }));

      expect(handleSlotClick).toHaveBeenCalledExactlyOnceWith(2);
    });

    test('marks a chosen card as pressed', () => {
      render(
        <TableCards
          slots={buildTableCards()}
          selectableSlotIndexes={[0, 1, 2]}
          selectedSlotIndexes={[0]}
          onSlotClick={vi.fn()}
        />,
      );
      expect(
        screen.getByRole('button', { name: 'Seven of Hearts' }),
      ).toHaveAttribute('aria-pressed', 'true');
    });
  });
});
