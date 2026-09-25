import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { buildClientPlayer, buildRoundScore } from '~/test-utils/yaniv';
import type { PlayerName, UserId } from '~/types/entities';
import { RoundSummary } from '.';

vi.mock('../scoreboard', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../scoreboard')>()),
  Scoreboard: ({ players }: { players: { name: string }[] }) => (
    <div data-testid='scoreboard'>
      {players.map(({ name }) => name).join(', ')}
    </div>
  ),
}));

const players = [
  buildClientPlayer({
    id: '1' as UserId,
    name: 'Alice' as PlayerName,
    score: 12,
    roundScores: [
      buildRoundScore({ original: 12 }),
      buildRoundScore({ original: 3, adjusted: 0 }),
    ],
  }),
  buildClientPlayer({
    id: '2' as UserId,
    name: 'Bob' as PlayerName,
    score: 30,
    roundScores: [
      buildRoundScore({ original: 5 }),
      buildRoundScore({ original: 7, adjusted: 25 }),
    ],
  }),
];

describe('RoundSummary', () => {
  test('shows which round has just finished', () => {
    render(<RoundSummary players={players} userId={'2' as UserId} />);
    expect(screen.getByText('Round 2')).toBeInTheDocument();
  });

  test('announces who won the round', () => {
    render(<RoundSummary players={players} userId={'2' as UserId} />);
    expect(screen.getByText('Alice won the round!')).toBeInTheDocument();
  });

  test('shows the scoreboard for every player', () => {
    render(<RoundSummary players={players} userId={'2' as UserId} />);
    expect(screen.getByTestId('scoreboard')).toHaveTextContent('Alice, Bob');
  });
});
