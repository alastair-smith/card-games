import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { toast } from '~/components/ui/toast';
import type { PlayerName, UserId } from '~/types/entities';
import GameOver from '.';
import { buildShareData, performShare } from './share';

vi.mock('~/components/ui/toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('./share', () => ({
  buildShareData: vi.fn().mockReturnValue({
    title: 'I just played a game of Yaniv!',
    text: '020 Alice',
    url: 'https://example.com/yaniv',
  }),
  performShare: vi.fn().mockResolvedValue('shared'),
}));

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

  describe('share button', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.mocked(performShare).mockResolvedValue('shared');
    });

    test('calls performShare with data from buildShareData when share is clicked', async () => {
      render(<GameOver players={players} userId={'2' as UserId} />);
      fireEvent.click(screen.getByRole('button', { name: /share/i }));
      expect(buildShareData).toHaveBeenCalledWith(
        players,
        '2' as UserId,
        expect.any(String),
      );
      expect(performShare).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'I just played a game of Yaniv!' }),
      );
    });

    test('shows clipboard toast when performShare resolves as copied', async () => {
      vi.mocked(performShare).mockResolvedValue('copied');
      render(<GameOver players={players} userId={'2' as UserId} />);
      fireEvent.click(screen.getByRole('button', { name: /share/i }));
      await vi.waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          'Game summary copied to clipboard!',
        );
      });
    });

    test('does not show clipboard toast when performShare resolves as shared', async () => {
      vi.mocked(performShare).mockResolvedValue('shared');
      render(<GameOver players={players} userId={'2' as UserId} />);
      fireEvent.click(screen.getByRole('button', { name: /share/i }));
      await vi.waitFor(() => {
        expect(toast.success).not.toHaveBeenCalled();
      });
    });

    test('shows error toast when performShare rejects', async () => {
      vi.mocked(performShare).mockRejectedValue(new Error('denied'));
      render(<GameOver players={players} userId={'2' as UserId} />);
      fireEvent.click(screen.getByRole('button', { name: /share/i }));
      await vi.waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to share the game summary. Please try again.',
        );
      });
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

    test('displays players in ascending score order regardless of input order', () => {
      const unsortedPlayers = [
        {
          id: '3' as UserId,
          name: 'Charlie' as PlayerName,
          score: 40,
          isWinner: false,
        },
        {
          id: '2' as UserId,
          name: 'Bob' as PlayerName,
          score: 30,
          isWinner: false,
        },
        {
          id: '1' as UserId,
          name: 'Alice' as PlayerName,
          score: 20,
          isWinner: true,
        },
      ];
      render(<GameOver players={unsortedPlayers} userId={'2' as UserId} />);
      const rows = screen.getAllByRole('row');
      // rows[0] is the header; rows[1..3] are player rows
      expect(rows[1]).toHaveTextContent('Alice');
      expect(rows[2]).toHaveTextContent('Bob');
      expect(rows[3]).toHaveTextContent('Charlie');
    });
  });
});
