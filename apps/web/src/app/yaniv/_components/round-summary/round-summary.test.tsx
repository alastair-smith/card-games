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
  describe('at the end of a round', () => {
    test('shows which round has just finished', () => {
      render(
        <RoundSummary players={players} userId={'2' as UserId} isRoundOver />,
      );
      expect(screen.getByText('Round 2')).toBeInTheDocument();
    });

    test('announces who won the round', () => {
      render(
        <RoundSummary players={players} userId={'2' as UserId} isRoundOver />,
      );
      expect(screen.getByText('Alice won the round!')).toBeInTheDocument();
    });

    test('shows the scoreboard for every player', () => {
      render(
        <RoundSummary players={players} userId={'2' as UserId} isRoundOver />,
      );
      expect(screen.getByTestId('scoreboard')).toHaveTextContent('Alice, Bob');
    });
  });

  describe('mid-round', () => {
    test('shows the scores after the last round played', () => {
      render(
        <RoundSummary
          players={players}
          userId={'2' as UserId}
          isRoundOver={false}
        />,
      );
      expect(screen.getByText('After round 2')).toBeInTheDocument();
      expect(screen.getByText('Scores')).toBeInTheDocument();
    });

    test('says no rounds have been played before the first one ends', () => {
      render(
        <RoundSummary
          players={[buildClientPlayer({ id: '1' as UserId })]}
          userId={'1' as UserId}
          isRoundOver={false}
        />,
      );
      expect(screen.getByText('No rounds played yet')).toBeInTheDocument();
    });
  });
});
