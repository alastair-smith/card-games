import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { toast } from '~/components/ui/toast';
import { GameType } from '~/types/game';
import { buildShareData, performShare } from '~/utils/share';
import { GameOver } from '.';

vi.mock('~/components/ui/toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('~/utils/share', () => ({
  buildShareData: vi.fn().mockReturnValue({
    title: 'I just played a game of Shithead!',
    text: '🥇 Alice',
    url: 'https://example.com/shithead',
  }),
  performShare: vi.fn().mockResolvedValue('shared'),
}));

vi.mock('~/components/layout/game-layout', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('~/components/emoji-rain/celebration-rain', () => ({
  CelebrationRain: ({
    children,
    emoji,
    isActive,
  }: {
    children: ReactNode;
    emoji: string;
    isActive: boolean;
  }) => (
    <div>
      {isActive && <span data-testid='celebration-rain'>{emoji}</span>}
      {children}
    </div>
  ),
}));

const renderGameOver = ({
  isUserWinner = false,
  shareText = '🥇 Alice',
}: {
  isUserWinner?: boolean;
  shareText?: string | (() => string);
} = {}) =>
  render(
    <GameOver
      gameType={GameType.SHITHEAD}
      title='Alice wins!'
      isUserWinner={isUserWinner}
      loserEmoji='💩'
      shareText={shareText}
    >
      <p>Leaderboard</p>
    </GameOver>,
  );

describe('GameOver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(performShare).mockResolvedValue('shared');
  });

  test('announces the winner', () => {
    renderGameOver();
    expect(
      screen.getByRole('heading', { name: 'Alice wins!' }),
    ).toBeInTheDocument();
  });

  test('shows the leaderboard', () => {
    renderGameOver();
    expect(screen.getByText('Leaderboard')).toBeInTheDocument();
  });

  test('links to the home page to pick another game', () => {
    renderGameOver();
    expect(
      screen.getByRole('link', { name: 'Pick Another Game' }),
    ).toHaveAttribute('href', '/');
  });

  describe('celebration', () => {
    test('rains emoji once the crown is pressed, and stops when it is pressed again', () => {
      renderGameOver();
      const crown = screen.getByRole('button', { name: 'Celebrate' });
      expect(screen.queryByTestId('celebration-rain')).not.toBeInTheDocument();

      fireEvent.click(crown);
      expect(screen.getByTestId('celebration-rain')).toBeInTheDocument();

      fireEvent.click(crown);
      expect(screen.queryByTestId('celebration-rain')).not.toBeInTheDocument();
    });

    test('rains trophies when you won', () => {
      renderGameOver({ isUserWinner: true });
      fireEvent.click(screen.getByRole('button', { name: 'Celebrate' }));
      expect(screen.getByTestId('celebration-rain')).toHaveTextContent('🏆');
    });

    test('shows a still emoji by the crown once it is pressed, for reduced motion', () => {
      renderGameOver({ isUserWinner: true });
      expect(
        screen.queryByTestId('still-celebration-emoji'),
      ).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Celebrate' }));
      const stillEmoji = screen.getByTestId('still-celebration-emoji');
      expect(stillEmoji).toHaveTextContent('🏆');
      expect(stillEmoji).toHaveClass('hidden', 'motion-reduce:block');
    });

    test("rains the game's loser emoji when someone else won", () => {
      renderGameOver();
      fireEvent.click(screen.getByRole('button', { name: 'Celebrate' }));
      expect(screen.getByTestId('celebration-rain')).toHaveTextContent('💩');
    });
  });

  describe('share button', () => {
    test('shares the given text', () => {
      renderGameOver({ isUserWinner: true });
      fireEvent.click(screen.getByRole('button', { name: /share/i }));
      expect(buildShareData).toHaveBeenCalledWith(
        expect.objectContaining({
          gameType: GameType.SHITHEAD,
          isUserWinner: true,
          text: '🥇 Alice',
        }),
      );
      expect(performShare).toHaveBeenCalledWith(
        expect.objectContaining({ text: '🥇 Alice' }),
      );
    });

    test('builds the text only when sharing, when given a function', () => {
      const shareText = vi.fn().mockReturnValue('🥇 Bob');
      renderGameOver({ shareText });
      expect(shareText).not.toHaveBeenCalled();

      fireEvent.click(screen.getByRole('button', { name: /share/i }));
      expect(buildShareData).toHaveBeenCalledWith(
        expect.objectContaining({ text: '🥇 Bob' }),
      );
    });

    test('shows a toast when the results are copied to the clipboard', async () => {
      vi.mocked(performShare).mockResolvedValue('copied');
      renderGameOver();
      fireEvent.click(screen.getByRole('button', { name: /share/i }));
      await vi.waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          'Results copied to clipboard!',
        );
      });
    });

    test('shows no toast when the results are shared', async () => {
      renderGameOver();
      fireEvent.click(screen.getByRole('button', { name: /share/i }));
      await vi.waitFor(() => {
        expect(performShare).toHaveBeenCalledOnce();
      });
      expect(toast.success).not.toHaveBeenCalled();
      expect(toast.error).not.toHaveBeenCalled();
    });

    test('shows no toast when sharing is cancelled', async () => {
      vi.mocked(performShare).mockResolvedValue('cancelled');
      renderGameOver();
      fireEvent.click(screen.getByRole('button', { name: /share/i }));
      await vi.waitFor(() => {
        expect(performShare).toHaveBeenCalledOnce();
      });
      expect(toast.success).not.toHaveBeenCalled();
      expect(toast.error).not.toHaveBeenCalled();
    });

    test('shows an error toast when sharing fails', async () => {
      vi.mocked(performShare).mockRejectedValue(new Error('denied'));
      renderGameOver();
      fireEvent.click(screen.getByRole('button', { name: /share/i }));
      await vi.waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to share the results. Please try again.',
        );
      });
    });
  });
});
