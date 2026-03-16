import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import type { PlayerName, UserId } from '~/types/entities';
import { RoundSummary } from '.';

const players = [
  {
    id: '1' as UserId,
    name: 'Alice' as PlayerName,
    roundScore: { original: 0, adjusted: 0 },
  },
  {
    id: '2' as UserId,
    name: 'Bob' as PlayerName,
    roundScore: { original: 8, adjusted: 8 },
  },
  {
    id: '3' as UserId,
    name: 'Charlie' as PlayerName,
    roundScore: { original: 15, adjusted: 15 },
  },
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

  test('shows plain score when adjusted matches original', () => {
    render(<RoundSummary players={players} />);
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  test('shows adjusted score with original in brackets when Yaniv was called', () => {
    const yanivPlayers = [
      {
        id: '1' as UserId,
        name: 'Alice' as PlayerName,
        roundScore: { original: 4, adjusted: 0 },
      },
      {
        id: '2' as UserId,
        name: 'Bob' as PlayerName,
        roundScore: { original: 3, adjusted: 25 },
      },
    ];
    render(<RoundSummary players={yanivPlayers} />);
    expect(screen.getByText('0 (4)')).toBeInTheDocument();
    expect(screen.getByText('25 (3)')).toBeInTheDocument();
  });

  test('renders a row for each player', () => {
    render(<RoundSummary players={players} />);
    const rows = screen.getAllByRole('row');
    // One header row + one row per player
    expect(rows).toHaveLength(players.length + 1);
  });
});
