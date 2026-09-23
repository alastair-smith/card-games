import { render, screen, within } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import type { PlayerName, UserId } from '~/types/entities';
import type { ScoreboardRow } from './rows';
import { ScoreboardTable } from './scoreboard-table';

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

const getCellText = (name: string) => {
  const row = screen.getByText(new RegExp(`^${name}`)).closest('tr');
  if (!row) throw new Error(`No row found for ${name}`);
  return within(row)
    .getAllByRole('cell')
    .map((cell) => cell.textContent);
};

describe('ScoreboardTable', () => {
  describe('latest round', () => {
    test('labels the only round column with the round number', () => {
      render(
        <ScoreboardTable rows={rows} roundNumbers={[2]} isExpanded={false} />,
      );
      expect(
        screen.getByRole('columnheader', { name: 'Round 2' }),
      ).toHaveTextContent('Round 2');
    });

    test('shows each player points for the round and their total', () => {
      render(
        <ScoreboardTable rows={rows} roundNumbers={[2]} isExpanded={false} />,
      );
      expect(getCellText('Charlie')).toEqual(['Charlie', '8', '8']);
    });
  });

  describe('all rounds', () => {
    test('shows a column for every round', () => {
      render(<ScoreboardTable rows={rows} roundNumbers={[1, 2]} isExpanded />);
      expect(
        screen.getByRole('columnheader', { name: 'Round 1' }),
      ).toBeInTheDocument();
      expect(getCellText('Charlie')).toEqual(['Charlie', '0', '8', '8']);
    });
  });

  describe('halved score', () => {
    test('shows how much the score dropped', () => {
      render(
        <ScoreboardTable rows={rows} roundNumbers={[2]} isExpanded={false} />,
      );
      expect(screen.getByText('(−25)')).toBeInTheDocument();
      expect(screen.getByText(', score halved by 25')).toBeInTheDocument();
    });
  });

  describe('current user', () => {
    test('marks the current user', () => {
      render(
        <ScoreboardTable rows={rows} roundNumbers={[2]} isExpanded={false} />,
      );
      expect(screen.getByText('Bob (You)')).toBeInTheDocument();
    });
  });
});
