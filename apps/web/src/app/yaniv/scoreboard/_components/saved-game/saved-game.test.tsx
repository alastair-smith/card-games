import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import type { PlayerName, UserId } from '~/types/entities';
import type { RoundId, ScoreboardState } from '../../_hooks/useYanivScoreboard';
import { deriveGameSummary } from '../../_libs/derive-game-summary';
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

const renderSavedGame = (
  handlers: Partial<{
    onContinue: () => void;
    onStartNew: () => void;
    onStartNewWithSamePlayers: () => void;
  }> = {},
) =>
  render(
    <SavedGame
      players={players}
      gameSummary={gameSummary}
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

  test('leaves the round that was being entered out of the totals', () => {
    renderSavedGame();

    expect(screen.queryByText('13')).not.toBeInTheDocument();
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

    fireEvent.click(screen.getByRole('button', { name: 'Start new game' }));

    expect(handleStartNew).toHaveBeenCalledOnce();
  });

  test('starts a new game with the same players', () => {
    const handleStartNewWithSamePlayers = vi.fn();
    renderSavedGame({
      onStartNewWithSamePlayers: handleStartNewWithSamePlayers,
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Start new game with same players' }),
    );

    expect(handleStartNewWithSamePlayers).toHaveBeenCalledOnce();
  });
});
