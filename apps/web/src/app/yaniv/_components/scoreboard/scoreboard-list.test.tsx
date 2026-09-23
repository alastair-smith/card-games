import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import type { PlayerName, UserId } from '~/types/entities';
import type { ScoreboardRow } from './rows';
import { ScoreboardList } from './scoreboard-list';

const rows: ScoreboardRow[] = [
  {
    id: '3' as UserId,
    name: 'Charlie' as PlayerName,
    score: 8,
    isUser: false,
    roundChanges: [
      { adjusted: 0, halvedBy: 0 },
      { adjusted: 8, halvedBy: 0 },
    ],
  },
  {
    id: '2' as UserId,
    name: 'Bob' as PlayerName,
    score: 5,
    isUser: true,
    roundChanges: [
      { adjusted: 5, halvedBy: 0 },
      { adjusted: 25, halvedBy: 25 },
    ],
  },
];

const getPlayerItem = (name: string) => {
  const item = screen.getByText(new RegExp(`^${name}`)).closest('li');
  if (!item) throw new Error(`No item found for ${name}`);
  return item;
};

describe('ScoreboardList', () => {
  describe('ordering', () => {
    test('lists players in the order given', () => {
      render(
        <ScoreboardList rows={rows} roundNumbers={[2]} isExpanded={false} />,
      );
      const [first, second] = screen.getByRole('list', {
        name: 'Scoreboard',
      }).children;
      expect(first).toHaveTextContent(/^Charlie/);
      expect(second).toHaveTextContent(/^Bob/);
    });
  });

  describe('latest round', () => {
    test('shows the points for the round and the total', () => {
      render(
        <ScoreboardList rows={rows} roundNumbers={[2]} isExpanded={false} />,
      );
      const charlie = getPlayerItem('Charlie');
      expect(charlie).toHaveTextContent('Round 2: 8');
      expect(charlie).toHaveTextContent('Total: 8');
    });
  });

  describe('all rounds', () => {
    test('shows the points for every round', () => {
      render(<ScoreboardList rows={rows} roundNumbers={[1, 2]} isExpanded />);
      const charlie = getPlayerItem('Charlie');
      expect(charlie).toHaveTextContent('Round 1: 0');
      expect(charlie).toHaveTextContent('Round 2: 8');
    });
  });

  describe('halved score', () => {
    test('shows how much the score dropped', () => {
      render(
        <ScoreboardList rows={rows} roundNumbers={[2]} isExpanded={false} />,
      );
      expect(getPlayerItem('Bob')).toHaveTextContent('25(−25)');
    });
  });

  describe('current user', () => {
    test('marks the current user', () => {
      render(
        <ScoreboardList rows={rows} roundNumbers={[2]} isExpanded={false} />,
      );
      expect(screen.getByText('Bob (You)')).toBeInTheDocument();
    });
  });
});
