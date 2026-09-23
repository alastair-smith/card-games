import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { toast } from '~/components/ui/toast';
import { buildClientPlayer } from '~/test-utils/yaniv';
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
      render(<GameOver players={twoWinners} userId={'1' as UserId} />);
      expect(
        screen.getByText(/You & Bob win with a score of 20!/),
      ).toBeInTheDocument();
    });

    test('shows both names joined for multiple winners when user did not win', () => {
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
