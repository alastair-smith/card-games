import { fireEvent, render, screen, within } from '@testing-library/react';
import type { ComponentProps, ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { stubBrowserApis } from '~/test-utils/browser';
import { buildClientPlayer } from '~/test-utils/shithead';
import type { PlayerName, UserId } from '~/types/entities';
import { GameStage } from '~/types/games/shithead';
import Game from '.';

vi.mock('~/components/layout/game-layout', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

const noop = () => {};

const buildPlayers = ({
  turnIndex = null,
  isUserSwapConfirmed = true,
}: {
  turnIndex?: number | null;
  isUserSwapConfirmed?: boolean;
}) =>
  (['Alice', 'Bob', 'Carol'] as PlayerName[]).map((name, index) => ({
    ...buildClientPlayer({
      id: String(index + 1) as UserId,
      name,
      isUser: index === 0,
      isSwapConfirmed: index === 0 ? isUserSwapConfirmed : true,
    }),
    isPlayersTurn: index === turnIndex,
  }));

const baseProps: ComponentProps<typeof Game> = {
  gameStage: GameStage.IN_PROGRESS,
  players: buildPlayers({ turnIndex: 1 }),
  deckSize: 20,
  discardSize: 0,
  visibleDiscardCards: [],
  hand: <div>Your cards</div>,
  onEmojiClick: noop,
};

const getHandTab = () => screen.getByRole('tab', { name: /Hand/ });

describe('Game', () => {
  beforeEach(() => stubBrowserApis());
  afterEach(() => vi.unstubAllGlobals());

  test('shows every player’s cards on the table', () => {
    render(<Game {...baseProps} />);
    const players = within(screen.getByRole('list', { name: 'Players' }));
    expect(players.getAllByRole('listitem')).toHaveLength(3);
    expect(players.getByText('Carol')).toBeInTheDocument();
  });

  test('marks the player whose turn it is', () => {
    render(<Game {...baseProps} />);
    const currentPlayer = screen
      .getAllByRole('listitem')
      .find((item) => item.getAttribute('aria-current') === 'step');
    expect(currentPlayer).toHaveTextContent('Bob');
  });

  test('shows the hand in its own tab', () => {
    render(<Game {...baseProps} />);
    expect(
      within(
        screen.getByRole('tabpanel', { name: /Hand/, hidden: true }),
      ).getByText('Your cards'),
    ).toBeInTheDocument();
  });

  describe('your move', () => {
    test('marks the Hand tab on your turn', () => {
      render(<Game {...baseProps} players={buildPlayers({ turnIndex: 0 })} />);
      expect(getHandTab()).toHaveTextContent('your move');
    });

    test('does not mark the Hand tab on another player’s turn', () => {
      render(<Game {...baseProps} />);
      expect(getHandTab()).not.toHaveTextContent('your move');
    });

    test('marks the Hand tab while you still need to swap', () => {
      render(
        <Game
          {...baseProps}
          gameStage={GameStage.SWAPPING}
          players={buildPlayers({ isUserSwapConfirmed: false })}
        />,
      );
      expect(getHandTab()).toHaveTextContent('your move');
    });

    test('does not mark the Hand tab once you have confirmed your swaps', () => {
      render(
        <Game
          {...baseProps}
          gameStage={GameStage.SWAPPING}
          players={buildPlayers({ isUserSwapConfirmed: true })}
        />,
      );
      expect(getHandTab()).not.toHaveTextContent('your move');
    });

    test('stops marking the Hand tab once you are on it', () => {
      render(<Game {...baseProps} players={buildPlayers({ turnIndex: 0 })} />);
      fireEvent.mouseDown(getHandTab());
      expect(getHandTab()).not.toHaveTextContent('your move');
    });
  });

  test('offers the Shithead emoji reactions', () => {
    const handleEmojiClick = vi.fn();
    render(<Game {...baseProps} onEmojiClick={handleEmojiClick} />);
    fireEvent.click(screen.getByRole('button', { name: '🪄' }));
    expect(handleEmojiClick).toHaveBeenCalledExactlyOnceWith('🪄');
  });
});
