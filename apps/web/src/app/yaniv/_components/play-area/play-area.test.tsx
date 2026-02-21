import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { Rank, Suit } from '~/types/cards';
import PlayArea from '.';

vi.mock('~/components/ui/playing-card', () => ({
  PlayingCard: ({
    card,
    onClick,
  }: {
    card: { suit: string; rank: string };
    onClick?: () => void;
  }) => (
    <button
      data-testid={`card-${card.suit}-${card.rank}`}
      onClick={onClick}
      type='button'
    >
      {card.rank}
    </button>
  ),
}));

vi.mock('~/components/ui/playing-card-stacks', () => ({
  PlayingCardDeck: ({ onClick }: { onClick?: () => void }) => (
    <button data-testid='deck' onClick={onClick} type='button'>
      Deck
    </button>
  ),
  PlayingCardDiscardPile: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='discard-pile'>{children}</div>
  ),
  PlayingCardStack: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='played-stack'>{children}</div>
  ),
}));

const discardCard = { suit: Suit.CLUBS, rank: Rank.FOUR };
const playedCards = [
  { suit: Suit.HEARTS, rank: Rank.SEVEN },
  { suit: Suit.DIAMONDS, rank: Rank.SEVEN },
];

describe('PlayArea', () => {
  test('always renders the deck', () => {
    render(<PlayArea discardCard={discardCard} playedCards={playedCards} />);
    expect(screen.getByTestId('deck')).toBeInTheDocument();
  });

  test('renders the discard card when one is present', () => {
    render(<PlayArea discardCard={discardCard} playedCards={playedCards} />);
    expect(
      screen.getByTestId(`card-${Suit.CLUBS}-${Rank.FOUR}`),
    ).toBeInTheDocument();
  });

  test('renders no discard card when the pile is empty', () => {
    render(<PlayArea discardCard={null} playedCards={playedCards} />);
    expect(
      screen.queryByTestId(`card-${Suit.CLUBS}-${Rank.FOUR}`),
    ).not.toBeInTheDocument();
  });

  test('renders all played cards', () => {
    render(<PlayArea discardCard={discardCard} playedCards={playedCards} />);
    expect(
      screen.getByTestId(`card-${Suit.HEARTS}-${Rank.SEVEN}`),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`card-${Suit.DIAMONDS}-${Rank.SEVEN}`),
    ).toBeInTheDocument();
  });

  test('renders no played cards when none have been played', () => {
    render(<PlayArea discardCard={discardCard} playedCards={[]} />);
    expect(
      screen.queryByTestId(`card-${Suit.HEARTS}-${Rank.SEVEN}`),
    ).not.toBeInTheDocument();
  });

  test('calls the deck handler when the deck is clicked', () => {
    const onDeckClick = vi.fn();
    render(
      <PlayArea
        discardCard={discardCard}
        playedCards={playedCards}
        onDeckClick={onDeckClick}
      />,
    );
    fireEvent.click(screen.getByTestId('deck'));
    expect(onDeckClick).toHaveBeenCalledOnce();
  });

  test('calls the discard handler when the discard card is clicked', () => {
    const onDiscardClick = vi.fn();
    render(
      <PlayArea
        discardCard={discardCard}
        playedCards={playedCards}
        onDiscardClick={onDiscardClick}
      />,
    );
    fireEvent.click(screen.getByTestId(`card-${Suit.CLUBS}-${Rank.FOUR}`));
    expect(onDiscardClick).toHaveBeenCalledOnce();
  });
});
