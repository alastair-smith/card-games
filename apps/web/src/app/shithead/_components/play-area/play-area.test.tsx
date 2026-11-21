import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { Rank, Suit } from '~/types/cards';
import { PlayArea } from '.';

describe('PlayArea', () => {
  test('says how many cards are left in the deck', () => {
    render(<PlayArea deckSize={12} discardSize={0} visibleDiscardCards={[]} />);
    expect(
      screen.getByRole('img', { name: 'Deck, 12 cards' }),
    ).toBeInTheDocument();
  });

  test('says when the deck is empty', () => {
    render(<PlayArea deckSize={0} discardSize={0} visibleDiscardCards={[]} />);
    expect(
      screen.getByRole('img', { name: 'Deck, empty' }),
    ).toBeInTheDocument();
  });

  test('says when the discard pile is empty', () => {
    render(<PlayArea deckSize={12} discardSize={0} visibleDiscardCards={[]} />);
    expect(
      screen.getByRole('region', { name: 'Discard pile' }),
    ).toHaveTextContent('Empty');
  });

  test('reads how many cards are in the discard pile, then the pile from the top card down', () => {
    render(
      <PlayArea
        deckSize={12}
        discardSize={9}
        visibleDiscardCards={[
          { suit: Suit.HEARTS, rank: Rank.FIVE },
          { suit: Suit.SPADES, rank: Rank.JACK },
        ]}
      />,
    );
    expect(
      screen.getByRole('region', { name: 'Discard pile' }),
    ).toHaveTextContent('9 cards, Five of Hearts, on Jack of Spades');
  });

  test('shows how many cards are in the deck and the discard pile', () => {
    render(
      <PlayArea
        deckSize={12}
        discardSize={7}
        visibleDiscardCards={[{ suit: Suit.HEARTS, rank: Rank.FIVE }]}
      />,
    );
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  describe('picking up', () => {
    test('picks up the discard pile when it is clicked', () => {
      const handleDiscardPileClick = vi.fn();
      render(
        <PlayArea
          deckSize={12}
          discardSize={4}
          visibleDiscardCards={[{ suit: Suit.HEARTS, rank: Rank.FIVE }]}
          onDiscardPileClick={handleDiscardPileClick}
        />,
      );

      fireEvent.click(
        screen.getByRole('button', { name: 'Pick up the discard pile' }),
      );

      expect(handleDiscardPileClick).toHaveBeenCalledOnce();
    });

    test('has nothing to pick up from an empty pile', () => {
      render(
        <PlayArea
          deckSize={12}
          discardSize={0}
          visibleDiscardCards={[]}
          onDiscardPileClick={vi.fn()}
        />,
      );
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    test('only shows the pile when it cannot be picked up', () => {
      render(
        <PlayArea
          deckSize={12}
          discardSize={4}
          visibleDiscardCards={[{ suit: Suit.HEARTS, rank: Rank.FIVE }]}
        />,
      );
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });
});
