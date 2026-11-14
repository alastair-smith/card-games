import { fireEvent, render, screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { toast } from '~/components/ui/toast';
import { buildClientFinishedPlayer } from '~/test-utils/shithead';
import type { PlayerName, UserId } from '~/types/entities';
import { performShare } from '~/utils/share';
import GameOver from '.';
import { buildShareData } from './share';

vi.mock('~/components/ui/toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('./share', () => ({
  buildShareData: vi.fn().mockReturnValue({
    title: 'I just played a game of Shithead!',
    text: '🥇 Alice',
    url: 'https://example.com/shithead',
  }),
}));

vi.mock('~/utils/share', () => ({
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

const alice = buildClientFinishedPlayer({
  id: '1' as UserId,
  name: 'Alice' as PlayerName,
  finishingPosition: 2,
});
const bob = buildClientFinishedPlayer({
  id: '2' as UserId,
  name: 'Bob' as PlayerName,
  finishingPosition: 3,
});
const charlie = buildClientFinishedPlayer({
  id: '3' as UserId,
  name: 'Charlie' as PlayerName,
  finishingPosition: 1,
});

describe('GameOver', () => {
  describe('winner announcement', () => {
    test('congratulates the player who finished first', () => {
      render(<GameOver players={[alice, bob, charlie]} />);
      expect(
        screen.getByRole('heading', { name: 'Charlie wins!' }),
      ).toBeInTheDocument();
    });

    test('congratulates you when you finished first', () => {
      render(<GameOver players={[alice, bob, { ...charlie, isUser: true }]} />);
      expect(
        screen.getByRole('heading', { name: 'You win!' }),
      ).toBeInTheDocument();
    });
  });

  describe('celebration', () => {
    test('rains emoji once the crown is pressed, and stops when it is pressed again', () => {
      render(<GameOver players={[alice, bob, charlie]} />);
      const crown = screen.getByRole('button', { name: 'Celebrate' });
      expect(screen.queryByTestId('celebration-rain')).not.toBeInTheDocument();

      fireEvent.click(crown);
      expect(screen.getByTestId('celebration-rain')).toBeInTheDocument();

      fireEvent.click(crown);
      expect(screen.queryByTestId('celebration-rain')).not.toBeInTheDocument();
    });

    test('rains trophies when you won', () => {
      render(<GameOver players={[alice, bob, { ...charlie, isUser: true }]} />);
      fireEvent.click(screen.getByRole('button', { name: 'Celebrate' }));
      expect(screen.getByTestId('celebration-rain')).toHaveTextContent('🏆');
    });

    test('rains poo when someone else won', () => {
      render(<GameOver players={[{ ...alice, isUser: true }, bob, charlie]} />);
      fireEvent.click(screen.getByRole('button', { name: 'Celebrate' }));
      expect(screen.getByTestId('celebration-rain')).toHaveTextContent('💩');
    });
  });

  describe('finishing order', () => {
    test('lists the players in the order they finished', () => {
      render(<GameOver players={[alice, bob, charlie]} />);
      const rows = within(screen.getByRole('list')).getAllByRole('listitem');
      expect(rows.map((row) => row.textContent)).toEqual([
        '1st🥇Charlie',
        '2nd🥈Alice',
        '3rd🥉Bob',
      ]);
    });

    test('shows 5th for the last player in a 5-player game', () => {
      render(
        <GameOver
          players={[
            charlie,
            alice,
            bob,
            buildClientFinishedPlayer({
              id: '4' as UserId,
              name: 'David' as PlayerName,
              finishingPosition: 4,
            }),
            buildClientFinishedPlayer({
              id: '5' as UserId,
              name: 'Eve' as PlayerName,
              finishingPosition: 5,
            }),
          ]}
        />,
      );
      const rows = within(screen.getByRole('list')).getAllByRole('listitem');
      expect(rows.at(-1)).toHaveTextContent('5thEve');
    });
  });

  describe('share button', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.mocked(performShare).mockResolvedValue('shared');
    });

    test('shares the players in the order they finished', () => {
      render(<GameOver players={[alice, bob, charlie]} />);
      fireEvent.click(screen.getByRole('button', { name: /share/i }));
      expect(buildShareData).toHaveBeenCalledWith(
        [charlie, alice, bob],
        expect.any(String),
      );
      expect(performShare).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'I just played a game of Shithead!',
        }),
      );
    });

    test('shows a toast when the results are copied to the clipboard', async () => {
      vi.mocked(performShare).mockResolvedValue('copied');
      render(<GameOver players={[alice, bob, charlie]} />);
      fireEvent.click(screen.getByRole('button', { name: /share/i }));
      await vi.waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          'Results copied to clipboard!',
        );
      });
    });

    test('shows an error toast when sharing fails', async () => {
      vi.mocked(performShare).mockRejectedValue(new Error('denied'));
      render(<GameOver players={[alice, bob, charlie]} />);
      fireEvent.click(screen.getByRole('button', { name: /share/i }));
      await vi.waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to share the results. Please try again.',
        );
      });
    });
  });

  test('links to the home page to pick another game', () => {
    render(<GameOver players={[alice, bob, charlie]} />);
    expect(
      screen.getByRole('link', { name: 'Pick Another Game' }),
    ).toHaveAttribute('href', '/');
  });
});
