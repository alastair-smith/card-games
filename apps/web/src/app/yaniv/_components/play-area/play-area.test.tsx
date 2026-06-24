import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { Rank, Suit } from '~/types/cards';
import PlayArea from '.';

vi.mock('~/components/ui/playing-card', () => ({
  PlayingCard: ({
    card,
    onClick,
  }: {
    card: { suit: string; rank: string } | null;
    onClick?: () => void;
  }) => {
    if (!card) return <div data-testid='card-face-down' />;
    return (
      <button
        data-testid={`card-${card.suit}-${card.rank}`}
        onClick={onClick}
        type='button'
      >
        {card.rank}
      </button>
    );
  },
}));

vi.mock('~/components/ui/playing-card-stacks', () => ({
  PlayingCardDeck: ({
    onClick,
    drawnCardDisplay,
    onDrawnCardClick,
    topCardHighlighted,
  }: {
    onClick?: () => void;
    drawnCardDisplay?: { suit: string; rank: string } | null;
    onDrawnCardClick?: () => void;
    topCardHighlighted?: boolean;
  }) => (
    <div data-testid='deck' data-highlighted={topCardHighlighted}>
      <button data-testid='deck-click' onClick={onClick} type='button'>
        Deck
      </button>
      {drawnCardDisplay !== undefined &&
        (drawnCardDisplay ? (
          <button
            data-testid={`drawn-card-${drawnCardDisplay.suit}-${drawnCardDisplay.rank}`}
            onClick={onDrawnCardClick}
            type='button'
          >
            {drawnCardDisplay.rank}
          </button>
        ) : (
          <div data-testid='drawn-card-face-down' />
        ))}
    </div>
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
    render(
      <PlayArea
        color='hsl(210 70% 48%)'
        discardCard={discardCard}
        playedCards={playedCards}
      />,
    );
    expect(screen.getByTestId('deck')).toBeInTheDocument();
  });

  test('renders the discard card when one is present', () => {
    render(
      <PlayArea
        color='hsl(210 70% 48%)'
        discardCard={discardCard}
        playedCards={playedCards}
      />,
    );
    expect(
      screen.getByTestId(`card-${Suit.CLUBS}-${Rank.FOUR}`),
    ).toBeInTheDocument();
  });

  test('renders no discard card when the pile is empty', () => {
    render(
      <PlayArea
        color='hsl(210 70% 48%)'
        discardCard={null}
        playedCards={playedCards}
      />,
    );
    expect(
      screen.queryByTestId(`card-${Suit.CLUBS}-${Rank.FOUR}`),
    ).not.toBeInTheDocument();
  });

  test('renders all played cards', () => {
    render(
      <PlayArea
        color='hsl(210 70% 48%)'
        discardCard={discardCard}
        playedCards={playedCards}
      />,
    );
    expect(
      screen.getByTestId(`card-${Suit.HEARTS}-${Rank.SEVEN}`),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`card-${Suit.DIAMONDS}-${Rank.SEVEN}`),
    ).toBeInTheDocument();
  });

  test('renders no played cards when none have been played', () => {
    render(
      <PlayArea
        color='hsl(210 70% 48%)'
        discardCard={discardCard}
        playedCards={[]}
      />,
    );
    expect(
      screen.queryByTestId(`card-${Suit.HEARTS}-${Rank.SEVEN}`),
    ).not.toBeInTheDocument();
  });

  test('calls the deck handler when the deck is clicked and the play area is active', () => {
    const onDeckClick = vi.fn();
    render(
      <PlayArea
        color='hsl(210 70% 48%)'
        discardCard={discardCard}
        playedCards={playedCards}
        onDeckClick={onDeckClick}
        isActive
      />,
    );
    fireEvent.click(screen.getByTestId('deck-click'));
    expect(onDeckClick).toHaveBeenCalledOnce();
  });

  test('calls the discard handler when the discard card is clicked and the play area is active', () => {
    const onDiscardClick = vi.fn();
    render(
      <PlayArea
        color='hsl(210 70% 48%)'
        discardCard={discardCard}
        playedCards={playedCards}
        onDiscardClick={onDiscardClick}
        isActive
      />,
    );
    fireEvent.click(screen.getByTestId(`card-${Suit.CLUBS}-${Rank.FOUR}`));
    expect(onDiscardClick).toHaveBeenCalledOnce();
  });

  describe('when the play area is not active', () => {
    test('does not call the deck handler when the deck is clicked', () => {
      const onDeckClick = vi.fn();
      render(
        <PlayArea
          color='hsl(210 70% 48%)'
          discardCard={discardCard}
          playedCards={playedCards}
          onDeckClick={onDeckClick}
          isActive={false}
        />,
      );
      fireEvent.click(screen.getByTestId('deck-click'));
      expect(onDeckClick).not.toHaveBeenCalled();
    });

    test('does not call the discard handler when the discard card is clicked', () => {
      const onDiscardClick = vi.fn();
      render(
        <PlayArea
          color='hsl(210 70% 48%)'
          discardCard={discardCard}
          playedCards={playedCards}
          onDiscardClick={onDiscardClick}
          isActive={false}
        />,
      );
      fireEvent.click(screen.getByTestId(`card-${Suit.CLUBS}-${Rank.FOUR}`));
      expect(onDiscardClick).not.toHaveBeenCalled();
    });
  });

  describe('drawn card', () => {
    const drawnCard = { suit: Suit.SPADES, rank: Rank.SEVEN };

    test('shows drawn card face down initially then face up after reveal', async () => {
      vi.useFakeTimers();
      render(
        <PlayArea
          color='hsl(210 70% 48%)'
          discardCard={discardCard}
          playedCards={playedCards}
          drawnCard={drawnCard}
        />,
      );

      expect(screen.getByTestId('drawn-card-face-down')).toBeInTheDocument();

      await act(async () => {
        vi.advanceTimersByTime(50);
      });

      expect(
        screen.getByTestId(`drawn-card-${drawnCard.suit}-${drawnCard.rank}`),
      ).toBeInTheDocument();
      vi.useRealTimers();
    });

    test('disables the deck click while drawn card is shown', async () => {
      vi.useFakeTimers();
      const onDeckClick = vi.fn();
      render(
        <PlayArea
          color='hsl(210 70% 48%)'
          discardCard={discardCard}
          playedCards={playedCards}
          drawnCard={drawnCard}
          onDeckClick={onDeckClick}
        />,
      );

      await act(async () => {
        vi.advanceTimersByTime(50);
      });

      fireEvent.click(screen.getByTestId('deck-click'));
      expect(onDeckClick).not.toHaveBeenCalled();
      vi.useRealTimers();
    });

    test('calls the auto-play handler when drawn card matches rank and is clicked', async () => {
      vi.useFakeTimers();
      const onAutoPlayDrawnCard = vi.fn();
      render(
        <PlayArea
          color='hsl(210 70% 48%)'
          discardCard={discardCard}
          playedCards={playedCards}
          drawnCard={drawnCard}
          canAutoPlay={true}
          onAutoPlayDrawnCard={onAutoPlayDrawnCard}
        />,
      );

      await act(async () => {
        vi.advanceTimersByTime(50);
      });

      fireEvent.click(
        screen.getByTestId(`drawn-card-${drawnCard.suit}-${drawnCard.rank}`),
      );
      expect(onAutoPlayDrawnCard).toHaveBeenCalledOnce();
      vi.useRealTimers();
    });

    test('dismisses drawn card to hand when drawn card does not match rank and is clicked', async () => {
      vi.useFakeTimers();
      const onAutoPlayDrawnCard = vi.fn();
      render(
        <PlayArea
          color='hsl(210 70% 48%)'
          discardCard={discardCard}
          playedCards={playedCards}
          drawnCard={drawnCard}
          canAutoPlay={false}
          onAutoPlayDrawnCard={onAutoPlayDrawnCard}
        />,
      );

      await act(async () => {
        vi.advanceTimersByTime(50);
      });

      fireEvent.click(
        screen.getByTestId(`drawn-card-${drawnCard.suit}-${drawnCard.rank}`),
      );

      expect(onAutoPlayDrawnCard).not.toHaveBeenCalled();

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      expect(
        screen.queryByTestId(`drawn-card-${drawnCard.suit}-${drawnCard.rank}`),
      ).not.toBeInTheDocument();
      vi.useRealTimers();
    });

    test('calls the dismissed handler when the drawn card is dismissed', async () => {
      vi.useFakeTimers();
      const onDrawnCardDismissed = vi.fn();
      render(
        <PlayArea
          color='hsl(210 70% 48%)'
          discardCard={discardCard}
          playedCards={playedCards}
          drawnCard={drawnCard}
          canAutoPlay={false}
          onDrawnCardDismissed={onDrawnCardDismissed}
        />,
      );

      await act(async () => {
        vi.advanceTimersByTime(50);
      });

      fireEvent.click(
        screen.getByTestId(`drawn-card-${drawnCard.suit}-${drawnCard.rank}`),
      );

      expect(onDrawnCardDismissed).not.toHaveBeenCalled();

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      expect(onDrawnCardDismissed).toHaveBeenCalledOnce();
      vi.useRealTimers();
    });

    test('highlights the top card when it can be insta played', () => {
      render(
        <PlayArea
          color='hsl(210 70% 48%)'
          discardCard={discardCard}
          playedCards={playedCards}
          canAutoPlay={true}
        />,
      );
      expect(screen.getByTestId('deck')).toHaveAttribute(
        'data-highlighted',
        'true',
      );
    });

    test('does not highlight top card when it cannot be insta played', () => {
      render(
        <PlayArea
          color='hsl(210 70% 48%)'
          discardCard={discardCard}
          playedCards={playedCards}
          canAutoPlay={false}
        />,
      );
      expect(screen.getByTestId('deck')).not.toHaveAttribute(
        'data-highlighted',
        'true',
      );
    });
  });
});
