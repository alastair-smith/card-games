import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import type { PlayerName, UserId } from '~/types/entities';
import type { RoundId, ScoreboardState } from '../../_hooks/useYanivScoreboard';
import { deriveGameSummary } from '../../_libs/derive-game-summary';
import ScoreTable from '.';

const ADA_ID = crypto.randomUUID() as UserId;
const GRACE_ID = crypto.randomUUID() as UserId;
const FIRST_ROUND_ID = crypto.randomUUID() as RoundId;
const SECOND_ROUND_ID = crypto.randomUUID() as RoundId;
const THIRD_ROUND_ID = crypto.randomUUID() as RoundId;

const players = [
  { id: ADA_ID, name: 'Ada' as PlayerName },
  { id: GRACE_ID, name: 'Grace' as PlayerName },
];

// Grace reaches 50 in the second round, halving her to 25.
const scoreboardState: ScoreboardState = {
  players,
  rounds: [
    {
      id: FIRST_ROUND_ID,
      isComplete: true,
      handTotals: { [ADA_ID]: 4, [GRACE_ID]: 30 },
    },
    {
      id: SECOND_ROUND_ID,
      isComplete: true,
      handTotals: { [ADA_ID]: 6, [GRACE_ID]: 20 },
    },
    {
      id: THIRD_ROUND_ID,
      isComplete: false,
      handTotals: { [ADA_ID]: 3 },
    },
  ],
};

const noop = vi.fn();

const renderScoreTable = ({
  currentRoundNumber,
  onRoundSelect = noop,
}: {
  currentRoundNumber?: number;
  onRoundSelect?: (roundNumber: number) => void;
} = {}) =>
  render(
    <ScoreTable
      players={players}
      rounds={scoreboardState.rounds}
      gameSummary={deriveGameSummary(scoreboardState)}
      currentRoundNumber={currentRoundNumber}
      onRoundSelect={onRoundSelect}
    />,
  );

// The header takes the first row, so a round's row follows its own number.
const rowFor = (roundNumber: number) => {
  const row = screen.getAllByRole('row')[roundNumber];
  if (!row) throw new Error(`No row for round ${roundNumber}`);
  return row;
};

const cellsIn = (row: HTMLElement) =>
  within(row)
    .getAllByRole('cell')
    .map((cell) => cell.textContent);

describe('ScoreTable', () => {
  test('heads a column with each player', () => {
    renderScoreTable();

    expect(
      screen.getByRole('columnheader', { name: 'Ada' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Grace' }),
    ).toBeInTheDocument();
  });

  test('gives a row to every round played', () => {
    renderScoreTable();

    expect(within(rowFor(1)).getByText('30')).toBeInTheDocument();
    expect(within(rowFor(2)).getByText('20')).toBeInTheDocument();
  });

  test('shows the scores entered so far into the round in progress', () => {
    renderScoreTable();

    // The round number, then Ada's score, then nothing for Grace yet.
    expect(cellsIn(rowFor(3))).toEqual(['3', '3', '–']);
  });

  test('marks the round a player was halved in', () => {
    renderScoreTable();

    expect(within(rowFor(2)).getByText('halved at 50')).toBeInTheDocument();
    expect(within(rowFor(1)).queryByText(/halved/)).not.toBeInTheDocument();
  });

  test('totals up the game so far', () => {
    renderScoreTable();

    const totalRow = screen
      .getAllByRole('row')
      .find((candidate) => within(candidate).queryByText('Total'));
    if (!totalRow) throw new Error('No total row');

    // Ada on 10, Grace halved to 25, with the round in progress left out.
    expect(within(totalRow).getByText('10')).toBeInTheDocument();
    expect(within(totalRow).getByText('25')).toBeInTheDocument();
  });

  test('picks out the round being entered alongside', () => {
    renderScoreTable({ currentRoundNumber: 3 });

    expect(rowFor(3)).toHaveAttribute('aria-current', 'true');
    expect(rowFor(1)).not.toHaveAttribute('aria-current');
  });

  test('turns to a round when its row is clicked', () => {
    const handleRoundSelect = vi.fn();
    renderScoreTable({ onRoundSelect: handleRoundSelect });

    fireEvent.click(rowFor(2));

    expect(handleRoundSelect).toHaveBeenCalledWith(2);
  });

  test('turns to a round from the keyboard', () => {
    const handleRoundSelect = vi.fn();
    renderScoreTable({ onRoundSelect: handleRoundSelect });

    fireEvent.click(
      within(rowFor(2)).getByRole('button', { name: 'Go to round 2' }),
    );

    expect(handleRoundSelect).toHaveBeenCalledWith(2);
  });
});
