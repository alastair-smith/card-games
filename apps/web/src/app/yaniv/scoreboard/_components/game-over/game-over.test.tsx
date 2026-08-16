import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import type { PlayerName, UserId } from '~/types/entities';
import type { RoundId, ScoreboardState } from '../../_hooks/useYanivScoreboard';
import { deriveGameSummary } from '../../_libs/derive-game-summary';
import GameOver from '.';

vi.mock('~/components/ui/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const ADA_ID = crypto.randomUUID() as UserId;
const GRACE_ID = crypto.randomUUID() as UserId;
const ALAN_ID = crypto.randomUUID() as UserId;

const players = [
  { id: ADA_ID, name: 'Ada' as PlayerName },
  { id: GRACE_ID, name: 'Grace' as PlayerName },
  { id: ALAN_ID, name: 'Alan' as PlayerName },
];

// Grace goes over 100, Alan finishes on the lowest score.
const wonGame = (): ScoreboardState => ({
  players,
  rounds: [
    {
      id: crypto.randomUUID() as RoundId,
      isComplete: true,
      handTotals: { [ADA_ID]: 40, [GRACE_ID]: 90, [ALAN_ID]: 12 },
    },
    {
      id: crypto.randomUUID() as RoundId,
      isComplete: true,
      handTotals: { [ADA_ID]: 5, [GRACE_ID]: 20, [ALAN_ID]: 3 },
    },
  ],
});

const noop = vi.fn();

const renderGameOver = (
  scoreboardState = wonGame(),
  onPlayAgain: () => void = noop,
) =>
  render(
    <GameOver
      players={scoreboardState.players}
      gameSummary={deriveGameSummary(scoreboardState)}
      onPlayAgain={onPlayAgain}
    />,
  );

const scoreRows = () =>
  screen
    .getAllByRole('row')
    .slice(1)
    .map((row) =>
      within(row)
        .getAllByRole('cell')
        .map((cell) => cell.textContent),
    );

describe('GameOver', () => {
  test('announces the player who won', () => {
    renderGameOver();

    expect(
      screen.getByText(/Alan wins with a score of 15/),
    ).toBeInTheDocument();
  });

  test('lists the players from the lowest score up', () => {
    renderGameOver();

    expect(scoreRows()).toEqual([
      ['Alan', '15'],
      ['Ada', '45'],
      ['Grace', '110'],
    ]);
  });

  test('announces every winner when a game is tied', () => {
    const tiedGame: ScoreboardState = {
      players: players.slice(0, 2),
      rounds: [
        {
          id: crypto.randomUUID() as RoundId,
          isComplete: true,
          handTotals: { [ADA_ID]: 101, [GRACE_ID]: 101 },
        },
      ],
    };

    renderGameOver(tiedGame);

    expect(
      screen.getByText(/Ada & Grace win with a score of 101/),
    ).toBeInTheDocument();
  });

  test('plays again with the same players', () => {
    const handlePlayAgain = vi.fn();
    renderGameOver(wonGame(), handlePlayAgain);

    fireEvent.click(screen.getByRole('button', { name: 'Play again' }));

    expect(handlePlayAgain).toHaveBeenCalledOnce();
  });

  test('offers the game up to be shared', () => {
    renderGameOver();

    expect(screen.getByRole('button', { name: 'Share' })).toBeInTheDocument();
  });
});
