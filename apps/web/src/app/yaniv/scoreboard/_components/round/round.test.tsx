import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import type { PlayerName, UserId } from '~/types/entities';
import type { RoundId, ScoreboardState } from '../../_hooks/useYanivScoreboard';
import {
  deriveGameSummary,
  type GameSummary,
} from '../../_libs/derive-game-summary';
import Round from '.';

const ADA_ID = crypto.randomUUID() as UserId;
const GRACE_ID = crypto.randomUUID() as UserId;
const FIRST_ROUND_ID = crypto.randomUUID() as RoundId;
const SECOND_ROUND_ID = crypto.randomUUID() as RoundId;

const players = [
  { id: ADA_ID, name: 'Ada' as PlayerName },
  { id: GRACE_ID, name: 'Grace' as PlayerName },
];

const playedRound: ScoreboardState['rounds'][number] = {
  id: FIRST_ROUND_ID,
  isComplete: true,
  handTotals: { [ADA_ID]: 4, [GRACE_ID]: 30 },
};

const roundInProgress: ScoreboardState['rounds'][number] = {
  id: SECOND_ROUND_ID,
  isComplete: false,
  handTotals: { [ADA_ID]: 7 },
};

const gameSummary = deriveGameSummary({
  players,
  rounds: [playedRound, roundInProgress],
});

const noop = vi.fn();

const renderRound = ({
  round = roundInProgress,
  roundNumber = 2,
  summary = gameSummary,
  errors,
  onScoreChange = noop,
}: {
  round?: ScoreboardState['rounds'][number];
  roundNumber?: number;
  summary?: GameSummary;
  errors?: Partial<Record<UserId, string>>;
  onScoreChange?: (playerId: UserId, handTotal: number | null) => void;
} = {}) =>
  render(
    <Round
      players={players}
      round={round}
      roundNumber={roundNumber}
      gameSummary={summary}
      errors={errors}
      onScoreChange={onScoreChange}
    />,
  );

describe('Round', () => {
  test('names the round being looked at', () => {
    renderRound({ roundNumber: 3 });

    expect(screen.getByText('Round 3')).toBeInTheDocument();
  });

  test('lists the players', () => {
    renderRound();

    expect(screen.getByText('Ada')).toBeInTheDocument();
    expect(screen.getByText('Grace')).toBeInTheDocument();
  });

  test('shows the score already entered for a player', () => {
    renderRound();

    expect(screen.getByLabelText('Round score for Ada')).toHaveValue(7);
  });

  test('leaves the box empty for a player yet to be scored', () => {
    renderRound();

    expect(screen.getByLabelText('Round score for Grace')).toHaveValue(null);
  });

  test('shows the total a player takes into the round', () => {
    renderRound();

    expect(screen.getByText('30')).toBeInTheDocument();
  });

  test('counts a score towards the total as it is entered', () => {
    renderRound();

    // Ada took 4 into the round and has 7 entered against her.
    expect(screen.getByText('11')).toBeInTheDocument();
  });

  test('shows the running total for a round already played', () => {
    renderRound({ round: playedRound, roundNumber: 1 });

    expect(screen.getByText('4')).toBeInTheDocument();
  });

  test('shows how far a player is from being halved', () => {
    renderRound();

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

    renderRound({ summary: passedFifty });

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

    renderRound({ summary: halvedAtFifty });

    expect(screen.getAllByText('50 score has been halved')).toHaveLength(1);
    expect(screen.getAllByText('50 score has not been halved')).toHaveLength(1);
  });

  test('says which score is missing when asked', () => {
    renderRound({ errors: { [GRACE_ID]: 'Enter score' } });

    expect(screen.getByRole('alert')).toHaveTextContent('Enter score');
  });

  test('marks the box a missing score belongs in', () => {
    renderRound({ errors: { [GRACE_ID]: 'Enter score' } });

    expect(screen.getByLabelText('Round score for Grace')).toBeInvalid();
    expect(screen.getByLabelText('Round score for Ada')).toBeValid();
  });

  test('reports a score as it is entered', () => {
    const handleScoreChange = vi.fn();
    renderRound({ onScoreChange: handleScoreChange });

    fireEvent.change(screen.getByLabelText('Round score for Grace'), {
      target: { value: '9' },
    });

    expect(handleScoreChange).toHaveBeenCalledWith(GRACE_ID, 9);
  });

  test('clears the score when the box is emptied', () => {
    const handleScoreChange = vi.fn();
    renderRound({ onScoreChange: handleScoreChange });

    fireEvent.change(screen.getByLabelText('Round score for Ada'), {
      target: { value: '' },
    });

    expect(handleScoreChange).toHaveBeenCalledWith(ADA_ID, null);
  });

  test('reports a score of nothing as a real score', () => {
    const handleScoreChange = vi.fn();
    renderRound({ onScoreChange: handleScoreChange });

    fireEvent.change(screen.getByLabelText('Round score for Grace'), {
      target: { value: '0' },
    });

    expect(handleScoreChange).toHaveBeenCalledWith(GRACE_ID, 0);
  });
});
