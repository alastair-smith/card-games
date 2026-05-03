import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { Rank, Suit } from '~/types/cards';
import type { PlayerName, UserId } from '~/types/entities';
import { GameViewStage } from '~/types/games/yaniv';
import Game from '.';

vi.mock('~/components/layout/game-layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock('~/components/ui/playing-card', () => ({
  PLAYING_CARD_PROPORTIONS: 'w-[3.75em] h-[5.25em]',
  PlayingCard: ({ card }: { card: { suit: string; rank: string } }) => (
    <div data-testid={`card-${card.suit}-${card.rank}`}>{card.rank}</div>
  ),
}));

vi.mock('~/components/ui/playing-card-stacks', () => ({
  PlayingCardDeck: ({
    drawnCardDisplay,
    onDrawnCardClick,
  }: {
    drawnCardDisplay?: { suit: string; rank: string } | null;
    onDrawnCardClick?: () => void;
  }) => (
    <div data-testid='deck'>
      {drawnCardDisplay && (
        <button
          data-testid={`drawn-card-${drawnCardDisplay.suit}-${drawnCardDisplay.rank}`}
          onClick={onDrawnCardClick}
          type='button'
        >
          {drawnCardDisplay.rank}
        </button>
      )}
      Deck
    </div>
  ),
  PlayingCardDiscardPile: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  PlayingCardStack: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock('~/components/emoji-reactions', () => ({
  EmojiReactions: () => <div data-testid='emoji-reactions' />,
}));

vi.mock('../how-to', () => ({
  HowToDialog: () => null,
}));

const baseProps = {
  onEmojiClick: vi.fn(),
  onEndTurnClick: vi.fn(),
  onYanivClick: vi.fn(),
  onPlayCards: vi.fn(),
  players: [
    {
      id: '1' as UserId,
      cardCount: 7,
      isFiftyScoreHalved: false,
      isHundredScoreHalved: false,
      name: 'Alice' as PlayerName,
      score: 10,
      roundScore: { original: 0, adjusted: 0 },
      isYanivCalled: false,
      isPlayersTurn: true,
    },
    {
      id: '2' as UserId,
      cardCount: 5,
      isFiftyScoreHalved: false,
      isHundredScoreHalved: false,
      name: 'Bob' as PlayerName,
      score: 20,
      roundScore: { original: 0, adjusted: 0 },
      isYanivCalled: false,
    },
  ],
  userId: '1' as UserId,
  cards: [{ suit: Suit.CLUBS, rank: Rank.ACE }],
  playedCards: [{ suit: Suit.HEARTS, rank: Rank.SEVEN }],
  discardCard: { suit: Suit.CLUBS, rank: Rank.FOUR },
  stage: GameViewStage.PICKING_CARDS,
};

describe('Game', () => {
  test('renders without crashing', () => {
    const { container } = render(<Game {...baseProps} />);
    expect(container).toBeInTheDocument();
  });

  test('shows a scorecard for each player', () => {
    render(<Game {...baseProps} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  test('shows the play area during an active round', () => {
    render(<Game {...baseProps} />);
    expect(screen.getByTestId('deck')).toBeInTheDocument();
  });

  test('shows the round summary at the end of a round', () => {
    render(<Game {...baseProps} stage={GameViewStage.END_OF_ROUND} />);
    expect(screen.getByText('Round Summary')).toBeInTheDocument();
  });

  test('shows the round summary when waiting for new round', () => {
    render(<Game {...baseProps} stage={GameViewStage.WAITING_FOR_NEW_ROUND} />);
    expect(screen.getByText('Round Summary')).toBeInTheDocument();
  });

  describe('drawn card visibility', () => {
    const drawnCard = { suit: Suit.CLUBS, rank: Rank.ACE };
    const cards = [
      { suit: Suit.CLUBS, rank: Rank.ACE },
      { suit: Suit.HEARTS, rank: Rank.FIVE },
    ];

    test('hides the drawn card from the hand while it is displayed on the deck', () => {
      render(<Game {...baseProps} cards={cards} drawnCard={drawnCard} />);
      expect(
        screen.queryByTestId(`card-${Suit.CLUBS}-${Rank.ACE}`),
      ).not.toBeInTheDocument();
      expect(
        screen.getByTestId(`card-${Suit.HEARTS}-${Rank.FIVE}`),
      ).toBeInTheDocument();
    });

    test('shows all hand cards when there is no drawn card', () => {
      render(<Game {...baseProps} cards={cards} />);
      expect(
        screen.getByTestId(`card-${Suit.CLUBS}-${Rank.ACE}`),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(`card-${Suit.HEARTS}-${Rank.FIVE}`),
      ).toBeInTheDocument();
    });

    test('includes the drawn card value in the hand total while it is displayed on the deck', () => {
      render(<Game {...baseProps} cards={cards} drawnCard={drawnCard} />);
      expect(screen.getByLabelText('Hand total')).toHaveTextContent('6');
    });

    test('shows the drawn card in the hand after the overlay is dismissed', async () => {
      vi.useFakeTimers();
      render(
        <Game
          {...baseProps}
          cards={cards}
          drawnCard={drawnCard}
          canAutoPlay={false}
        />,
      );

      await act(async () => {
        vi.advanceTimersByTime(50);
      });

      fireEvent.click(
        screen.getByTestId(`drawn-card-${drawnCard.suit}-${drawnCard.rank}`),
      );

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      expect(
        screen.getByTestId(`card-${Suit.CLUBS}-${Rank.ACE}`),
      ).toBeInTheDocument();
      vi.useRealTimers();
    });
  });
});
