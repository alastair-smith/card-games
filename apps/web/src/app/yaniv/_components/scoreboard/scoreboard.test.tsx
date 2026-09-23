import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { buildClientPlayer } from '~/test-utils/yaniv';
import type { UserId } from '~/types/entities';
import { Scoreboard } from '.';

vi.mock('./scoreboard-list', () => ({
  ScoreboardList: ({ roundNumbers }: { roundNumbers: number[] }) => (
    <div data-testid='scoreboard-list'>{roundNumbers.join(',')}</div>
  ),
}));

vi.mock('./scoreboard-table', () => ({
  ScoreboardTable: ({ roundNumbers }: { roundNumbers: number[] }) => (
    <div data-testid='scoreboard-table'>{roundNumbers.join(',')}</div>
  ),
}));

const roundScore = (original: number) => ({
  original,
  adjusted: original,
  isScoreHalved: false,
});

const threeRoundPlayers = [
  buildClientPlayer({
    id: '1' as UserId,
    roundScores: [roundScore(5), roundScore(8), roundScore(3)],
  }),
];

describe('Scoreboard', () => {
  describe('latest round', () => {
    test('shows only the latest round by default', () => {
      render(<Scoreboard players={threeRoundPlayers} userId={'1' as UserId} />);
      expect(screen.getByTestId('scoreboard-list')).toHaveTextContent(/^3$/);
      expect(screen.getByTestId('scoreboard-table')).toHaveTextContent(/^3$/);
    });

    test('shows no rounds before any round has been scored', () => {
      render(
        <Scoreboard players={[buildClientPlayer()]} userId={'1' as UserId} />,
      );
      expect(screen.getByTestId('scoreboard-table')).toBeEmptyDOMElement();
    });
  });

  describe('all rounds', () => {
    test('shows every round once all rounds are shown', () => {
      render(<Scoreboard players={threeRoundPlayers} userId={'1' as UserId} />);
      fireEvent.click(screen.getByRole('button', { name: /show all rounds/i }));
      expect(screen.getByTestId('scoreboard-list')).toHaveTextContent('1,2,3');
      expect(screen.getByTestId('scoreboard-table')).toHaveTextContent('1,2,3');
    });

    test('hides earlier rounds again', () => {
      render(<Scoreboard players={threeRoundPlayers} userId={'1' as UserId} />);
      fireEvent.click(screen.getByRole('button', { name: /show all rounds/i }));
      fireEvent.click(
        screen.getByRole('button', { name: /hide earlier rounds/i }),
      );
      expect(screen.getByTestId('scoreboard-table')).toHaveTextContent(/^3$/);
    });

    test('reports whether all rounds are shown', () => {
      render(<Scoreboard players={threeRoundPlayers} userId={'1' as UserId} />);
      const toggle = screen.getByRole('button', { name: /show all rounds/i });
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
      fireEvent.click(toggle);
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
    });

    test('can start with every round shown', () => {
      render(
        <Scoreboard
          players={threeRoundPlayers}
          userId={'1' as UserId}
          isInitiallyExpanded
        />,
      );
      expect(screen.getByTestId('scoreboard-table')).toHaveTextContent('1,2,3');
      expect(
        screen.getByRole('button', { name: /hide earlier rounds/i }),
      ).toBeInTheDocument();
    });

    test('offers no way to show all rounds after the first round', () => {
      render(
        <Scoreboard
          players={[buildClientPlayer({ roundScores: [roundScore(4)] })]}
          userId={'1' as UserId}
        />,
      );
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });
});
