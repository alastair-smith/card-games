import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, test, vi } from 'vitest';
import { buildClientPlayer } from '~/test-utils/yaniv';
import type { PlayerName, UserId } from '~/types/entities';
import GameOver from '.';

vi.mock('~/components/game-over', () => ({
  GameOver: ({
    title,
    isUserWinner,
    loserEmoji,
    shareText,
    children,
  }: {
    title: ReactNode;
    isUserWinner: boolean;
    loserEmoji: string;
    shareText: string | (() => string);
    children: ReactNode;
  }) => (
    <div>
      <h2>{title}</h2>
      <p>{isUserWinner ? 'User won' : 'User did not win'}</p>
      <p>Loser emoji: {loserEmoji}</p>
      <pre data-testid='share-text'>
        {typeof shareText === 'function' ? shareText() : shareText}
      </pre>
      {children}
    </div>
  ),
}));

vi.mock('../how-to', () => ({
  HowToDialog: () => null,
}));

vi.mock('../scoreboard', () => ({
  Scoreboard: ({
    players,
    userId,
    isInitiallyExpanded,
  }: {
    players: { id: string; name: string }[];
    userId: string;
    isInitiallyExpanded?: boolean;
  }) => (
    <div data-testid='scoreboard'>
      {isInitiallyExpanded && 'all rounds shown: '}
      {players
        .map(({ id, name }) => (id === userId ? `${name} (You)` : name))
        .join(', ')}
    </div>
  ),
}));

const gamePlayer = (
  id: string,
  name: string,
  score: number,
  isWinner: boolean,
) => ({
  ...buildClientPlayer({
    id: id as UserId,
    name: name as PlayerName,
    score,
  }),
  isWinner,
});

const players = [
  gamePlayer('1', 'Alice', 20, true),
  gamePlayer('2', 'Bob', 30, false),
  gamePlayer('3', 'Charlie', 40, false),
];

const twoWinners = [
  gamePlayer('1', 'Alice', 20, true),
  gamePlayer('2', 'Bob', 20, true),
];

describe('GameOver', () => {
  describe('winner announcement', () => {
    test('shows the winning player name when someone else won', () => {
      render(<GameOver players={players} userId={'2' as UserId} />);
      expect(
        screen.getByRole('heading', { name: 'Alice wins with a score of 20!' }),
      ).toBeInTheDocument();
      expect(screen.getByText('User did not win')).toBeInTheDocument();
    });

    test('shows "You" when the current user won', () => {
      render(<GameOver players={players} userId={'1' as UserId} />);
      expect(
        screen.getByRole('heading', { name: 'You win with a score of 20!' }),
      ).toBeInTheDocument();
      expect(screen.getByText('User won')).toBeInTheDocument();
    });

    test('shows both names joined for multiple winners when user is among them', () => {
      render(<GameOver players={twoWinners} userId={'1' as UserId} />);
      expect(
        screen.getByRole('heading', {
          name: 'You & Bob win with a score of 20!',
        }),
      ).toBeInTheDocument();
    });

    test('shows both names joined for multiple winners when user did not win', () => {
      render(<GameOver players={twoWinners} userId={'3' as UserId} />);
      expect(
        screen.getByRole('heading', {
          name: 'Alice & Bob win with a score of 20!',
        }),
      ).toBeInTheDocument();
    });
  });

  test('rains rubbish bins for the players who did not win', () => {
    render(<GameOver players={players} userId={'2' as UserId} />);
    expect(screen.getByText('Loser emoji: 🗑️')).toBeInTheDocument();
  });

  test('shares every player with their score', () => {
    render(<GameOver players={players} userId={'2' as UserId} />);
    expect(screen.getByTestId('share-text')).toHaveTextContent(
      '020 Alice 🏆 030 Bob 040 Charlie',
    );
  });

  describe('scoreboard', () => {
    test('shows the scoreboard for every player with the current user marked', () => {
      render(<GameOver players={players} userId={'2' as UserId} />);
      expect(screen.getByTestId('scoreboard')).toHaveTextContent(
        'Alice, Bob (You), Charlie',
      );
    });

    test('shows every round of the game', () => {
      render(<GameOver players={players} userId={'2' as UserId} />);
      expect(screen.getByTestId('scoreboard')).toHaveTextContent(
        /^all rounds shown/,
      );
    });
  });
});
