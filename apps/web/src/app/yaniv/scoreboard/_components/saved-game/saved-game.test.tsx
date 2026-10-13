import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import type { PlayerName, UserId } from '~/types/entities';
import type { RoundId, ScoreboardState } from '../../_hooks/useYanivScoreboard';
import {
  deriveGameSummary,
  previewGameSummary,
} from '../../_libs/derive-game-summary';
import SavedGame from '.';

const ADA_ID = crypto.randomUUID() as UserId;
const GRACE_ID = crypto.randomUUID() as UserId;

const players = [
  { id: ADA_ID, name: 'Ada' as PlayerName },
  { id: GRACE_ID, name: 'Grace' as PlayerName },
];

const scoreboardState: ScoreboardState = {
  players,
  rounds: [
    {
      id: crypto.randomUUID() as RoundId,
      isComplete: true,
      handTotals: { [ADA_ID]: 4, [GRACE_ID]: 30 },
    },
    {
      id: crypto.randomUUID() as RoundId,
      isComplete: false,
      handTotals: { [ADA_ID]: 9 },
    },
  ],
};

const gameSummary = deriveGameSummary(scoreboardState);

const noop = vi.fn();

// Grace goes over 100, so the game is won and there is nothing to carry on.
const finishedGameSummary = deriveGameSummary({
  players,
  rounds: [
    {
      id: crypto.randomUUID() as RoundId,
      isComplete: true,
      handTotals: { [ADA_ID]: 4, [GRACE_ID]: 101 },
    },
  ],
});

const renderSavedGame = (
  handlers: Partial<{
    summary: typeof gameSummary;
    onContinue: () => void;
    onStartNew: () => void;
    onStartNewWithSamePlayers: () => void;
  }> = {},
) =>
  render(
    <SavedGame
      players={players}
      gameSummary={handlers.summary ?? gameSummary}
      onContinue={handlers.onContinue ?? noop}
      onStartNew={handlers.onStartNew ?? noop}
      onStartNewWithSamePlayers={handlers.onStartNewWithSamePlayers ?? noop}
    />,
  );

describe('SavedGame', () => {
  test('names the players in the saved game', () => {
    renderSavedGame();

    expect(screen.getByText('Ada')).toBeInTheDocument();
    expect(screen.getByText('Grace')).toBeInTheDocument();
  });

  test('shows the total each player is on', () => {
    renderSavedGame();

    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  test('counts the round that was being entered towards the totals', () => {
    renderSavedGame({
      // Ada took 4 into the round being entered, with 9 against her in it.
      summary: previewGameSummary(scoreboardState, gameSummary),
    });

    expect(screen.getByText('13')).toBeInTheDocument();
  });

  test('lists the players from the lowest score up', () => {
    renderSavedGame();

    const scores = screen
      .getAllByRole('row')
      .slice(1)
      .map((row) =>
        within(row)
          .getAllByRole('cell')
          .map((cell) => cell.textContent),
      );

    expect(scores).toEqual([
      ['Ada', '4'],
      ['Grace', '30'],
    ]);
  });

  test('does not offer to carry on a game that has been won', () => {
    renderSavedGame({ summary: finishedGameSummary });

    expect(
      screen.queryByRole('button', { name: 'Continue game' }),
    ).not.toBeInTheDocument();
  });

  test('still offers a new game once the last one has been won', () => {
    renderSavedGame({ summary: finishedGameSummary });

    expect(
      screen.getByRole('button', { name: 'New game' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Play again' }),
    ).toBeInTheDocument();
  });

  test('carries on with the saved game', () => {
    const handleContinue = vi.fn();
    renderSavedGame({ onContinue: handleContinue });

    fireEvent.click(screen.getByRole('button', { name: 'Continue game' }));

    expect(handleContinue).toHaveBeenCalledOnce();
  });

  test('starts a new game', () => {
    const handleStartNew = vi.fn();
    renderSavedGame({ onStartNew: handleStartNew });

    fireEvent.click(screen.getByRole('button', { name: 'New game' }));

    expect(handleStartNew).toHaveBeenCalledOnce();
  });

  test('starts a new game with the same players', () => {
    const handleStartNewWithSamePlayers = vi.fn();
    renderSavedGame({
      onStartNewWithSamePlayers: handleStartNewWithSamePlayers,
    });

    fireEvent.click(screen.getByRole('button', { name: 'Play again' }));

    expect(handleStartNewWithSamePlayers).toHaveBeenCalledOnce();
  });
});
