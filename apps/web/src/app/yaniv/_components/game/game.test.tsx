import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { Rank, Suit } from '~/types/cards';
import type { PlayerName, UserId } from '~/types/entities';
import Game from '.';

vi.mock('~/components/layout/game-layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock('~/components/emoji-rain/emoji-rain', () => ({
  EmojiRain: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock('~/components/ui/playing-card', () => ({
  PlayingCard: ({ card }: { card: { suit: string; rank: string } }) => (
    <div data-testid={`card-${card.suit}-${card.rank}`}>{card.rank}</div>
  ),
}));

vi.mock('~/components/ui/playing-card-stacks', () => ({
  PlayingCardDeck: () => <div data-testid='deck'>Deck</div>,
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
      isYanivCalled: false,
    },
  ],
  userId: '1' as UserId,
  cards: [{ suit: Suit.CLUBS, rank: Rank.ACE }],
  playedCards: [{ suit: Suit.HEARTS, rank: Rank.SEVEN }],
  discardCard: { suit: Suit.CLUBS, rank: Rank.FOUR },
  stage: 'picking-cards' as const,
  roundSummary: null,
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
    render(
      <Game
        {...baseProps}
        stage='end-of-round'
        roundSummary={[
          {
            id: '1' as UserId,
            name: 'Alice' as PlayerName,
            roundScore: { original: 5, adjusted: 5 },
          },
          {
            id: '2' as UserId,
            name: 'Bob' as PlayerName,
            roundScore: { original: 15, adjusted: 15 },
          },
        ]}
      />,
    );
    expect(screen.getByText('Round Summary')).toBeInTheDocument();
  });
});
