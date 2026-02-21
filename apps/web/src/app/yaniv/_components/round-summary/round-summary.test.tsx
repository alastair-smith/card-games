import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import type { PlayerName, UserId } from '~/types/entities';
import { RoundSummary } from '.';

const players = [
  { id: '1' as UserId, name: 'Alice' as PlayerName, score: 0 },
  { id: '2' as UserId, name: 'Bob' as PlayerName, score: 8 },
  { id: '3' as UserId, name: 'Charlie' as PlayerName, score: 15 },
];

describe('RoundSummary', () => {
  test('shows the round summary caption', () => {
    render(<RoundSummary players={players} />);
    expect(screen.getByText('Round Summary')).toBeInTheDocument();
  });

  test('shows all player names', () => {
    render(<RoundSummary players={players} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  test('shows all player hand scores', () => {
    render(<RoundSummary players={players} />);
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  test('renders a row for each player', () => {
    render(<RoundSummary players={players} />);
    const rows = screen.getAllByRole('row');
    // One header row + one row per player
    expect(rows).toHaveLength(players.length + 1);
  });
});
