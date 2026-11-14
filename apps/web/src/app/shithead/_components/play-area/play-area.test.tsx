import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { Rank, Suit } from '~/types/cards';
import { PlayArea } from '.';

describe('PlayArea', () => {
  test('says how many cards are left in the deck', () => {
    render(<PlayArea deckSize={12} visibleDiscardCards={[]} />);
    expect(
      screen.getByRole('img', { name: 'Deck, 12 cards' }),
    ).toBeInTheDocument();
  });

  test('says when the deck is empty', () => {
    render(<PlayArea deckSize={0} visibleDiscardCards={[]} />);
    expect(
      screen.getByRole('img', { name: 'Deck, empty' }),
    ).toBeInTheDocument();
  });

  test('says when the discard pile is empty', () => {
    render(<PlayArea deckSize={12} visibleDiscardCards={[]} />);
    expect(
      screen.getByRole('region', { name: 'Discard pile' }),
    ).toHaveTextContent('Empty');
  });

  test('reads the discard pile from the top card down', () => {
    render(
      <PlayArea
        deckSize={12}
        visibleDiscardCards={[
          { suit: Suit.HEARTS, rank: Rank.FIVE },
          { suit: Suit.SPADES, rank: Rank.JACK },
        ]}
      />,
    );
    expect(
      screen.getByRole('region', { name: 'Discard pile' }),
    ).toHaveTextContent('Five of Hearts, on Jack of Spades');
  });
});
