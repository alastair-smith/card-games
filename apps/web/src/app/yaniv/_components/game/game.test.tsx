import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { stubBrowserApis } from '~/test-utils/browser';
import { buildClientPlayer } from '~/test-utils/yaniv';
import { Rank, Suit } from '~/types/cards';
import type { PlayerName, UserId } from '~/types/entities';
import { GameStep, GameViewStage } from '~/types/games/yaniv';
import Game from '.';

vi.mock('~/components/layout/game-layout', () => ({
  default: ({
    children,
    actions,
  }: {
    children: React.ReactNode;
    actions: React.ReactNode;
  }) => (
    <div>
      {actions}
      {children}
    </div>
  ),
}));

vi.mock('~/components/ui/playing-card', () => ({
  PlayingCard: ({ card }: { card: { suit: string; rank: string } | null }) =>
    card ? (
      <div data-testid={`card-${card.suit}-${card.rank}`}>{card.rank}</div>
    ) : (
      <div data-testid='card-face-down' />
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

vi.mock('../scores-dialog', () => ({
  ScoresDialog: () => null,
}));

vi.mock('../round-summary', () => ({
  RoundSummary: ({ isRoundOver }: { isRoundOver: boolean }) => (
    <div data-testid={isRoundOver ? 'round-summary' : 'scores'} />
  ),
}));

const baseProps = {
  onEmojiClick: vi.fn(),
  onEndTurnClick: vi.fn(),
  onYanivClick: vi.fn(),
  onPlayCards: vi.fn(),
  players: [
    {
      ...buildClientPlayer({
        id: '1' as UserId,
        color: 'red',
        cardCount: 7,
        name: 'Alice' as PlayerName,
        score: 10,
      }),
      isPlayersTurn: true,
    },
    buildClientPlayer({
      id: '2' as UserId,
      cardCount: 5,
      name: 'Bob' as PlayerName,
      score: 20,
    }),
  ],
  userId: '1' as UserId,
  cards: [{ suit: Suit.CLUBS, rank: Rank.ACE }],
  playedCards: [{ suit: Suit.HEARTS, rank: Rank.SEVEN }],
  discardCard: { suit: Suit.CLUBS, rank: Rank.FOUR },
  stage: GameViewStage.PICKING_CARDS,
  step: GameStep.PLAY_CARDS,
  pickupSource: null,
};

const getPanel = (name: string | RegExp) =>
  screen.getByRole('tabpanel', { name });
const getTab = (name: RegExp) => screen.getByRole('tab', { name });

describe('Game', () => {
  beforeEach(() => stubBrowserApis());
  afterEach(() => vi.unstubAllGlobals());

  test('shows a tag for each player', () => {
    render(<Game {...baseProps} />);
    const playerList = screen.getByRole('list', { name: 'Players' });
    expect(within(playerList).getByText('Alice')).toBeInTheDocument();
    expect(within(playerList).getByText('Bob')).toBeInTheDocument();
  });

  test('announces what to do on your turn', () => {
    render(<Game {...baseProps} />);
    expect(
      screen.getByText('Your turn: choose what to play', {
        selector: '[role="status"]',
      }),
    ).toBeInTheDocument();
  });

  test('shows the play area during an active round', () => {
    render(<Game {...baseProps} />);
    expect(screen.getByTestId('deck')).toBeInTheDocument();
  });

  describe('end of round', () => {
    test('shows the round summary in the Scores tab', () => {
      render(<Game {...baseProps} stage={GameViewStage.END_OF_ROUND} />);
      expect(
        within(getPanel('Scores')).getByTestId('round-summary'),
      ).toBeInTheDocument();
    });

    test('shows the round summary in place of the play area on larger screens', () => {
      render(<Game {...baseProps} stage={GameViewStage.END_OF_ROUND} />);
      expect(
        within(getPanel('Table')).getByTestId('round-summary'),
      ).toBeInTheDocument();
    });

    test('shows the round summary when waiting for the new round', () => {
      render(
        <Game {...baseProps} stage={GameViewStage.WAITING_FOR_NEW_ROUND} />,
      );
      expect(
        within(getPanel('Scores')).getByTestId('round-summary'),
      ).toBeInTheDocument();
    });

    test('shows the scores so far mid-round', () => {
      render(<Game {...baseProps} />);
      expect(
        within(getPanel('Scores')).getByTestId('scores'),
      ).toBeInTheDocument();
    });
  });

  describe('tabs', () => {
    test('opens the table when it is your turn to play, to see what was last played', () => {
      render(<Game {...baseProps} />);
      expect(getTab(/Table/)).toHaveAttribute('aria-selected', 'true');
    });

    test('stays on the tab you chose when your turn starts', () => {
      const { rerender } = render(
        <Game
          {...baseProps}
          players={baseProps.players.map((player) => ({
            ...player,
            isPlayersTurn: player.id === '2',
          }))}
          stage={GameViewStage.WAITING_FOR_PLAYER}
        />,
      );
      fireEvent.mouseDown(getTab(/Scores/));
      rerender(<Game {...baseProps} />);
      expect(getTab(/Scores/)).toHaveAttribute('aria-selected', 'true');
    });

    test('stays on the tab you chose as another player takes their turn', () => {
      const props = {
        ...baseProps,
        userId: '2' as UserId,
        stage: GameViewStage.WAITING_FOR_PLAYER,
      };
      const { rerender } = render(<Game {...props} />);
      fireEvent.mouseDown(getTab(/Scores/));
      rerender(<Game {...props} step={GameStep.PICKUP_CARD} />);
      rerender(<Game {...props} step={GameStep.PROCEED} />);
      expect(getTab(/Scores/)).toHaveAttribute('aria-selected', 'true');
    });

    test('opens the table on another player’s turn', () => {
      render(
        <Game
          {...baseProps}
          userId={'2' as UserId}
          stage={GameViewStage.WAITING_FOR_PLAYER}
        />,
      );
      expect(getTab(/Table/)).toHaveAttribute('aria-selected', 'true');
    });

    test('switches to the table when you need to pick up', () => {
      const { rerender } = render(<Game {...baseProps} />);
      fireEvent.mouseDown(getTab(/Your hand/));
      rerender(
        <Game
          {...baseProps}
          stage={GameViewStage.DRAWING_CARDS}
          step={GameStep.PICKUP_CARD}
        />,
      );
      expect(getTab(/Table/)).toHaveAttribute('aria-selected', 'true');
    });

    test('switches to the table when you have played and have nothing to pick up', () => {
      const { rerender } = render(<Game {...baseProps} />);
      fireEvent.mouseDown(getTab(/Your hand/));
      rerender(
        <Game
          {...baseProps}
          stage={GameViewStage.END_TURN}
          step={GameStep.PROCEED}
        />,
      );
      expect(getTab(/Table/)).toHaveAttribute('aria-selected', 'true');
    });

    test('stays on the tab you chose after picking up', () => {
      const props = {
        ...baseProps,
        stage: GameViewStage.DRAWING_CARDS,
        step: GameStep.PICKUP_CARD,
      };
      const { rerender } = render(<Game {...props} />);
      fireEvent.mouseDown(getTab(/Your hand/));
      rerender(
        <Game
          {...props}
          stage={GameViewStage.END_TURN}
          step={GameStep.PROCEED}
        />,
      );
      expect(getTab(/Your hand/)).toHaveAttribute('aria-selected', 'true');
    });

    test('switches the dealer to the table when they deal the next round', () => {
      const { rerender } = render(
        <Game
          {...baseProps}
          stage={GameViewStage.END_OF_ROUND}
          step={GameStep.REDEAL}
        />,
      );
      rerender(<Game {...baseProps} />);
      expect(getTab(/Table/)).toHaveAttribute('aria-selected', 'true');
    });

    test('switches everyone else to the table when the next round is dealt', () => {
      const props = {
        ...baseProps,
        userId: '2' as UserId,
        stage: GameViewStage.WAITING_FOR_NEW_ROUND,
        step: GameStep.REDEAL,
      };
      const { rerender } = render(<Game {...props} />);
      rerender(
        <Game
          {...props}
          stage={GameViewStage.WAITING_FOR_PLAYER}
          step={GameStep.PLAY_CARDS}
        />,
      );
      expect(getTab(/Table/)).toHaveAttribute('aria-selected', 'true');
    });

    test('switches everyone to the scores when the round ends', () => {
      const props = {
        ...baseProps,
        userId: '2' as UserId,
        stage: GameViewStage.WAITING_FOR_PLAYER,
      };
      const { rerender } = render(<Game {...props} />);
      rerender(
        <Game
          {...props}
          stage={GameViewStage.WAITING_FOR_NEW_ROUND}
          step={GameStep.REDEAL}
        />,
      );
      expect(getTab(/Scores/)).toHaveAttribute('aria-selected', 'true');
    });

    test('marks the tab with your next move when you are on another tab', () => {
      render(<Game {...baseProps} />);
      expect(getTab(/Your hand/)).toHaveTextContent('your move');
    });

    test('does not mark the tab you are on', () => {
      render(<Game {...baseProps} />);
      fireEvent.mouseDown(getTab(/Your hand/));
      expect(getTab(/Your hand/)).not.toHaveTextContent('your move');
    });

    test('keeps the panels you are not on out of reach', () => {
      render(<Game {...baseProps} />);
      expect(getPanel(/Your hand/)).toHaveAttribute('inert');
      expect(getPanel('Table')).not.toHaveAttribute('inert');
    });

    test('keeps every panel in reach on larger screens, which show them together', () => {
      stubBrowserApis({ matchingQueries: ['(min-width: 1024px)'] });
      render(<Game {...baseProps} />);
      expect(getPanel('Table')).not.toHaveAttribute('inert');
      expect(getPanel(/Your hand/)).not.toHaveAttribute('inert');
    });
  });

  describe('turn buttons', () => {
    test('puts Play Cards on the hand tab', () => {
      render(<Game {...baseProps} />);
      expect(
        within(getPanel(/Your hand/)).getByRole('button', {
          name: /Play Cards/,
        }),
      ).toBeInTheDocument();
    });

    test('puts Yaniv and End Turn on the table tab', () => {
      render(
        <Game
          {...baseProps}
          stage={GameViewStage.END_TURN}
          step={GameStep.PROCEED}
        />,
      );
      const table = within(getPanel('Table'));
      expect(table.getByRole('button', { name: /Yaniv!/ })).toBeInTheDocument();
      expect(
        table.getByRole('button', { name: /End Turn/ }),
      ).toBeInTheDocument();
    });

    test('puts Start new round on the scores tab', () => {
      render(
        <Game
          {...baseProps}
          stage={GameViewStage.END_OF_ROUND}
          step={GameStep.REDEAL}
        />,
      );
      expect(
        within(getPanel('Scores')).getByRole('button', {
          name: /Start new round/,
        }),
      ).toBeInTheDocument();
    });

    test('shows no turn buttons on another player’s turn', () => {
      render(
        <Game
          {...baseProps}
          userId={'2' as UserId}
          stage={GameViewStage.WAITING_FOR_PLAYER}
        />,
      );
      expect(
        screen.queryByRole('button', { name: /Play Cards/ }),
      ).not.toBeInTheDocument();
    });
  });

  describe('face down', () => {
    const drawnCard = { suit: Suit.HEARTS, rank: Rank.FIVE };
    const cards = [
      { suit: Suit.CLUBS, rank: Rank.ACE },
      { suit: Suit.HEARTS, rank: Rank.FIVE },
    ];

    const turnFaceDown = () =>
      fireEvent.click(
        screen.getByRole('button', { name: /Toggle visibility/ }),
      );

    test('turns your cards face down', () => {
      render(<Game {...baseProps} cards={cards} />);
      turnFaceDown();
      expect(screen.getAllByTestId('card-face-down')).toHaveLength(2);
    });

    test('hides Play Cards while your cards are face down', () => {
      render(<Game {...baseProps} />);
      turnFaceDown();
      // Smaller screens' copy sits in the hand tab; larger screens' is beside
      // the hand
      const largeScreenPlayCards = screen
        .getAllByRole('button', { name: /Play Cards/ })
        .find((button) => !getPanel(/Your hand/).contains(button));
      expect(largeScreenPlayCards?.parentElement).toHaveClass('invisible');
    });

    test('hides the card you picked up from the deck', () => {
      render(
        <Game
          {...baseProps}
          cards={cards}
          drawnCard={drawnCard}
          stage={GameViewStage.END_TURN}
          step={GameStep.PROCEED}
        />,
      );
      turnFaceDown();
      expect(
        screen.queryByTestId(`drawn-card-${drawnCard.suit}-${drawnCard.rank}`),
      ).not.toBeInTheDocument();
      expect(screen.getAllByTestId('card-face-down')).toHaveLength(2);
    });
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
