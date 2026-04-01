import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import type { PlayerName, UserId } from '~/types/entities';
import GameOver from '.';

vi.mock('~/components/layout/game-layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock('~/components/emoji-rain/celebration-rain', () => ({
  CelebrationRain: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock('../how-to', () => ({
  HowToDialog: () => null,
}));

const players = [
  { id: '1' as UserId, name: 'Alice' as PlayerName, score: 20, isWinner: true },
  { id: '2' as UserId, name: 'Bob' as PlayerName, score: 30, isWinner: false },
  {
    id: '3' as UserId,
    name: 'Charlie' as PlayerName,
    score: 40,
    isWinner: false,
  },
];

describe('GameOver', () => {
  describe('winner announcement', () => {
    test('shows the winning player name when someone else won', () => {
      render(<GameOver players={players} userId={'2' as UserId} />);
      expect(
        screen.getByText(/Alice wins with a score of 20!/),
      ).toBeInTheDocument();
    });

    test('shows "You" when the current user won', () => {
      render(<GameOver players={players} userId={'1' as UserId} />);
      expect(
        screen.getByText(/You win with a score of 20!/),
      ).toBeInTheDocument();
    });

    test('shows both names joined for multiple winners when user is among them', () => {
      const twoWinners = [
        {
          id: '1' as UserId,
          name: 'Alice' as PlayerName,
          score: 20,
          isWinner: true,
        },
        {
          id: '2' as UserId,
          name: 'Bob' as PlayerName,
          score: 20,
          isWinner: true,
        },
      ];
      render(<GameOver players={twoWinners} userId={'1' as UserId} />);
      expect(
        screen.getByText(/You & Bob win with a score of 20!/),
      ).toBeInTheDocument();
    });

    test('shows both names joined for multiple winners when user did not win', () => {
      const twoWinners = [
        {
          id: '1' as UserId,
          name: 'Alice' as PlayerName,
          score: 20,
          isWinner: true,
        },
        {
          id: '2' as UserId,
          name: 'Bob' as PlayerName,
          score: 20,
          isWinner: true,
        },
      ];
      render(<GameOver players={twoWinners} userId={'3' as UserId} />);
      expect(
        screen.getByText(/Alice & Bob win with a score of 20!/),
      ).toBeInTheDocument();
    });
  });

  describe('scores table', () => {
    test('shows all player names', () => {
      render(<GameOver players={players} userId={'2' as UserId} />);
      expect(screen.getAllByText('Alice').length).toBeGreaterThan(0);
      expect(screen.getByText('Bob (You)')).toBeInTheDocument();
      expect(screen.getByText('Charlie')).toBeInTheDocument();
    });

    test('shows all player scores', () => {
      render(<GameOver players={players} userId={'2' as UserId} />);
      expect(screen.getByText('30')).toBeInTheDocument();
      expect(screen.getByText('40')).toBeInTheDocument();
    });

    test('marks the current user with (You)', () => {
      render(<GameOver players={players} userId={'2' as UserId} />);
      expect(screen.getByText('Bob (You)')).toBeInTheDocument();
    });
  });
});
