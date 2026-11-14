import { render, screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, test, vi } from 'vitest';
import { buildClientFinishedPlayer } from '~/test-utils/shithead';
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
      <h1>{title}</h1>
      <p>{isUserWinner ? 'User won' : 'User did not win'}</p>
      <p>Loser emoji: {loserEmoji}</p>
      <pre data-testid='share-text'>
        {typeof shareText === 'function' ? shareText() : shareText}
      </pre>
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
      expect(screen.getByText('User did not win')).toBeInTheDocument();
    });

    test('congratulates you when you finished first', () => {
      render(<GameOver players={[alice, bob, { ...charlie, isUser: true }]} />);
      expect(
        screen.getByRole('heading', { name: 'You win!' }),
      ).toBeInTheDocument();
      expect(screen.getByText('User won')).toBeInTheDocument();
    });
  });

  test('rains poo for the players who did not win', () => {
    render(<GameOver players={[alice, bob, charlie]} />);
    expect(screen.getByText('Loser emoji: 💩')).toBeInTheDocument();
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

  test('shares the finishing order', () => {
    render(<GameOver players={[alice, bob, charlie]} />);
    expect(screen.getByTestId('share-text')).toHaveTextContent(
      '🥇 Charlie 🥈 Alice 🥉 Bob',
    );
  });
});
