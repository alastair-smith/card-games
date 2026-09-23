import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { buildClientPlayer } from '~/test-utils/yaniv';
import type { PlayerName, UserId } from '~/types/entities';
import { Scoreboard } from '.';

const roundScore = (
  original: number,
  adjusted = original,
  isScoreHalved = false,
) => ({ original, adjusted, isScoreHalved });

const alice = buildClientPlayer({
  id: '1' as UserId,
  name: 'Alice' as PlayerName,
  score: 12,
  roundScores: [roundScore(12), roundScore(3, 0)],
});
const bob = buildClientPlayer({
  id: '2' as UserId,
  name: 'Bob' as PlayerName,
  score: 30,
  roundScores: [roundScore(5), roundScore(7, 25)],
});
const charlie = buildClientPlayer({
  id: '3' as UserId,
  name: 'Charlie' as PlayerName,
  score: 8,
  roundScores: [roundScore(0), roundScore(8)],
});

const players = [alice, bob, charlie];

const getPlayerCells = (name: string) => {
  const row = screen.getByText(new RegExp(`^${name}`)).closest('tr');
  if (!row) throw new Error(`No row found for ${name}`);
  return within(row)
    .getAllByRole('cell')
    .map((cell) => cell.textContent);
};

const showAllRounds = () =>
  fireEvent.click(screen.getByRole('button', { name: /show all rounds/i }));

describe('Scoreboard', () => {
  describe('ordering', () => {
    test('lists players from lowest total score to highest', () => {
      render(<Scoreboard players={players} userId={'1' as UserId} />);
      const [, ...playerRows] = screen.getAllByRole('row');
      expect(playerRows[0]).toHaveTextContent('Charlie');
      expect(playerRows[1]).toHaveTextContent('Alice');
      expect(playerRows[2]).toHaveTextContent('Bob');
    });
  });

  describe('latest round', () => {
    test('shows only the latest round by default', () => {
      render(<Scoreboard players={players} userId={'1' as UserId} />);
      expect(
        screen.getByRole('columnheader', { name: 'Round 2' }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('columnheader', { name: 'Round 1' }),
      ).not.toBeInTheDocument();
    });

    test('shows the points each player scored in the latest round and their total', () => {
      render(<Scoreboard players={players} userId={'1' as UserId} />);
      expect(getPlayerCells('Bob')).toEqual(['Bob', '25', '30']);
    });

    test('shows how much the score dropped when it was halved on 50', () => {
      const halvedPlayer = buildClientPlayer({
        id: '4' as UserId,
        name: 'Dana' as PlayerName,
        score: 25,
        roundScores: [roundScore(40), roundScore(10, 10, true)],
      });
      render(<Scoreboard players={[halvedPlayer]} userId={'1' as UserId} />);
      expect(screen.getByText('(−25)')).toBeInTheDocument();
      expect(screen.getByText(', score halved by 25')).toBeInTheDocument();
    });

    test('shows how much the score dropped when it was halved on 100', () => {
      const halvedPlayer = buildClientPlayer({
        id: '4' as UserId,
        name: 'Dana' as PlayerName,
        score: 50,
        roundScores: [
          roundScore(40),
          roundScore(10, 10, true),
          roundScore(45),
          roundScore(30, 30, true),
        ],
      });
      render(<Scoreboard players={[halvedPlayer]} userId={'1' as UserId} />);
      expect(screen.getByText('(−50)')).toBeInTheDocument();
    });

    test('shows no round column before any round has been scored', () => {
      const newPlayers = [
        buildClientPlayer({ id: '1' as UserId, name: 'Alice' as PlayerName }),
      ];
      render(<Scoreboard players={newPlayers} userId={'1' as UserId} />);
      expect(screen.getAllByRole('columnheader')).toHaveLength(2);
    });
  });

  describe('all rounds', () => {
    test('shows every round once all rounds are shown', () => {
      render(<Scoreboard players={players} userId={'1' as UserId} />);
      showAllRounds();
      expect(
        screen.getByRole('columnheader', { name: 'Round 1' }),
      ).toBeInTheDocument();
      expect(getPlayerCells('Bob')).toEqual(['Bob', '5', '25', '30']);
    });

    test('hides earlier rounds again', () => {
      render(<Scoreboard players={players} userId={'1' as UserId} />);
      showAllRounds();
      fireEvent.click(
        screen.getByRole('button', { name: /hide earlier rounds/i }),
      );
      expect(
        screen.queryByRole('columnheader', { name: 'Round 1' }),
      ).not.toBeInTheDocument();
    });

    test('reports whether all rounds are shown', () => {
      render(<Scoreboard players={players} userId={'1' as UserId} />);
      const toggle = screen.getByRole('button', { name: /show all rounds/i });
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
      showAllRounds();
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
    });

    test('offers no way to show all rounds after the first round', () => {
      const firstRoundPlayers = [
        buildClientPlayer({
          id: '1' as UserId,
          name: 'Alice' as PlayerName,
          roundScores: [roundScore(4, 0)],
        }),
      ];
      render(<Scoreboard players={firstRoundPlayers} userId={'1' as UserId} />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('current user', () => {
    test('marks the current user', () => {
      render(<Scoreboard players={players} userId={'2' as UserId} />);
      expect(screen.getByText('Bob (You)')).toBeInTheDocument();
      expect(screen.queryByText('Alice (You)')).not.toBeInTheDocument();
    });
  });
});
