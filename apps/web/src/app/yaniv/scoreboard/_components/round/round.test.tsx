import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import type { PlayerName, UserId } from '~/types/entities';
import type { RoundId, ScoreboardState } from '../../_hooks/useYanivScoreboard';
import { deriveGameSummary } from '../../_libs/derive-game-summary';
import Round from '.';

const ADA_ID = crypto.randomUUID() as UserId;
const GRACE_ID = crypto.randomUUID() as UserId;
const FIRST_ROUND_ID = crypto.randomUUID() as RoundId;
const SECOND_ROUND_ID = crypto.randomUUID() as RoundId;

const players = [
  { id: ADA_ID, name: 'Ada' as PlayerName },
  { id: GRACE_ID, name: 'Grace' as PlayerName },
];

const roundInProgress: ScoreboardState['rounds'][number] = {
  id: SECOND_ROUND_ID,
  isComplete: false,
  handTotals: { [ADA_ID]: 7 },
};

const scoreboardState: ScoreboardState = {
  players,
  rounds: [
    {
      id: FIRST_ROUND_ID,
      isComplete: true,
      handTotals: { [ADA_ID]: 4, [GRACE_ID]: 30 },
    },
    roundInProgress,
  ],
};

const gameSummary = deriveGameSummary(scoreboardState);

const noop = vi.fn();

describe('Round', () => {
  test('lists the players', () => {
    render(
      <Round
        players={players}
        round={roundInProgress}
        gameSummary={gameSummary}
        onScoreChange={noop}
      />,
    );

    expect(screen.getByText('Ada')).toBeInTheDocument();
    expect(screen.getByText('Grace')).toBeInTheDocument();
  });

  test('shows the score already entered for a player', () => {
    render(
      <Round
        players={players}
        round={roundInProgress}
        gameSummary={gameSummary}
        onScoreChange={noop}
      />,
    );

    expect(screen.getByLabelText('Round score for Ada')).toHaveValue(7);
  });

  test('leaves the box empty for a player yet to be scored', () => {
    render(
      <Round
        players={players}
        round={roundInProgress}
        gameSummary={gameSummary}
        onScoreChange={noop}
      />,
    );

    expect(screen.getByLabelText('Round score for Grace')).toHaveValue(null);
  });

  test('shows the total a player takes into the round', () => {
    render(
      <Round
        players={players}
        round={roundInProgress}
        gameSummary={gameSummary}
        onScoreChange={noop}
      />,
    );

    expect(screen.getByText('30')).toBeInTheDocument();
  });

  test('shows the running total for a round already played', () => {
    const firstRound = scoreboardState.rounds[0];
    if (!firstRound) throw new Error('Expected a first round');

    render(
      <Round
        players={players}
        round={firstRound}
        gameSummary={gameSummary}
        onScoreChange={noop}
      />,
    );

    expect(screen.getByText('4')).toBeInTheDocument();
  });

  test('shows how far a player is from being halved', () => {
    render(
      <Round
        players={players}
        round={roundInProgress}
        gameSummary={gameSummary}
        onScoreChange={noop}
      />,
    );

    expect(screen.getByText('20 from 50')).toBeInTheDocument();
  });

  test('shows how far a player is beyond a total they missed', () => {
    const passedFifty = deriveGameSummary({
      players,
      rounds: [
        {
          id: FIRST_ROUND_ID,
          isComplete: true,
          handTotals: { [ADA_ID]: 4, [GRACE_ID]: 60 },
        },
      ],
    });

    render(
      <Round
        players={players}
        round={roundInProgress}
        gameSummary={passedFifty}
        onScoreChange={noop}
      />,
    );

    expect(screen.getByText('40 from 100')).toBeInTheDocument();
  });

  test('marks the players who have had their score halved', () => {
    const halvedAtFifty = deriveGameSummary({
      players,
      rounds: [
        {
          id: FIRST_ROUND_ID,
          isComplete: true,
          handTotals: { [ADA_ID]: 4, [GRACE_ID]: 50 },
        },
      ],
    });

    render(
      <Round
        players={players}
        round={roundInProgress}
        gameSummary={halvedAtFifty}
        onScoreChange={noop}
      />,
    );

    expect(screen.getAllByText('50 score has been halved')).toHaveLength(1);
    expect(screen.getAllByText('50 score has not been halved')).toHaveLength(1);
  });

  test('says which score is missing when asked', () => {
    render(
      <Round
        players={players}
        round={roundInProgress}
        gameSummary={gameSummary}
        errors={{ [GRACE_ID]: 'Enter a score for Grace' }}
        onScoreChange={noop}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Enter a score for Grace',
    );
  });

  test('marks the box a missing score belongs in', () => {
    render(
      <Round
        players={players}
        round={roundInProgress}
        gameSummary={gameSummary}
        errors={{ [GRACE_ID]: 'Enter a score for Grace' }}
        onScoreChange={noop}
      />,
    );

    expect(screen.getByLabelText('Round score for Grace')).toBeInvalid();
    expect(screen.getByLabelText('Round score for Ada')).toBeValid();
  });

  test('reports a score as it is entered', () => {
    const handleScoreChange = vi.fn();
    render(
      <Round
        players={players}
        round={roundInProgress}
        gameSummary={gameSummary}
        onScoreChange={handleScoreChange}
      />,
    );

    fireEvent.change(screen.getByLabelText('Round score for Grace'), {
      target: { value: '9' },
    });

    expect(handleScoreChange).toHaveBeenCalledWith(GRACE_ID, 9);
  });

  test('clears the score when the box is emptied', () => {
    const handleScoreChange = vi.fn();
    render(
      <Round
        players={players}
        round={roundInProgress}
        gameSummary={gameSummary}
        onScoreChange={handleScoreChange}
      />,
    );

    fireEvent.change(screen.getByLabelText('Round score for Ada'), {
      target: { value: '' },
    });

    expect(handleScoreChange).toHaveBeenCalledWith(ADA_ID, null);
  });

  test('reports a score of nothing as a real score', () => {
    const handleScoreChange = vi.fn();
    render(
      <Round
        players={players}
        round={roundInProgress}
        gameSummary={gameSummary}
        onScoreChange={handleScoreChange}
      />,
    );

    fireEvent.change(screen.getByLabelText('Round score for Grace'), {
      target: { value: '0' },
    });

    expect(handleScoreChange).toHaveBeenCalledWith(GRACE_ID, 0);
  });
});
