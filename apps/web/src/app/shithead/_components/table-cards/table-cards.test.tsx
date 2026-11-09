import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
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
});
