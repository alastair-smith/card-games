import { describe, expect, test } from 'vitest';
import type { PlayerName, UserId } from '~/types/entities';
import type { RoundId, ScoreboardState } from '../_hooks/useYanivScoreboard';
import { deriveGameSummary } from './derive-game-summary';
import {
  getHalvingTarget,
  getPlayerRoundTotal,
  getPlayerTotal,
  getRoundHalving,
  hasHalvedFiftyScore,
  hasHalvedHundredScore,
  isPlayerWinner,
} from './read-game-summary';

const ADA_ID = crypto.randomUUID() as UserId;
const GRACE_ID = crypto.randomUUID() as UserId;
const FIRST_ROUND_ID = crypto.randomUUID() as RoundId;
const SECOND_ROUND_ID = crypto.randomUUID() as RoundId;
const THIRD_ROUND_ID = crypto.randomUUID() as RoundId;

const gamePlayers = [
  { id: ADA_ID, name: 'Ada' as PlayerName },
  { id: GRACE_ID, name: 'Grace' as PlayerName },
];

const round = (
  id: RoundId,
  handTotals: Record<UserId, number>,
  isComplete = true,
): ScoreboardState['rounds'][number] => ({ id, isComplete, handTotals });

// Grace lands on 50 in the second round, halving her to 25.
const halvingGame = deriveGameSummary({
  players: gamePlayers,
  rounds: [
    round(FIRST_ROUND_ID, { [ADA_ID]: 4, [GRACE_ID]: 30 }),
    round(SECOND_ROUND_ID, { [ADA_ID]: 6, [GRACE_ID]: 20 }),
    round(THIRD_ROUND_ID, { [ADA_ID]: 2, [GRACE_ID]: 8 }, false),
  ],
});

describe('reading the game summary', () => {
  describe('totals', () => {
    test('gives a player their total as the game stands', () => {
      expect(getPlayerTotal(halvingGame, GRACE_ID)).toBe(25);
    });

    test('gives nothing for a player who is not in the game', () => {
      expect(getPlayerTotal(halvingGame, crypto.randomUUID() as UserId)).toBe(
        0,
      );
    });

    test('gives a player their running total after a round', () => {
      expect(getPlayerRoundTotal(halvingGame, FIRST_ROUND_ID, GRACE_ID)).toBe(
        30,
      );
      expect(getPlayerRoundTotal(halvingGame, SECOND_ROUND_ID, GRACE_ID)).toBe(
        25,
      );
    });

    test('gives no running total for the round still being entered', () => {
      expect(
        getPlayerRoundTotal(halvingGame, THIRD_ROUND_ID, GRACE_ID),
      ).toBeNull();
    });
  });

  describe('halving', () => {
    test('reports a player who has been halved at fifty', () => {
      expect(hasHalvedFiftyScore(halvingGame, GRACE_ID)).toBe(true);
    });

    test('reports a player who has not been halved at fifty', () => {
      expect(hasHalvedFiftyScore(halvingGame, ADA_ID)).toBe(false);
    });

    test('reports a player who has not been halved at a hundred', () => {
      expect(hasHalvedHundredScore(halvingGame, GRACE_ID)).toBe(false);
    });

    test('reports a player who has been halved at a hundred', () => {
      const gameSummary = deriveGameSummary({
        players: gamePlayers,
        rounds: [
          round(FIRST_ROUND_ID, { [ADA_ID]: 0, [GRACE_ID]: 60 }),
          round(SECOND_ROUND_ID, { [ADA_ID]: 0, [GRACE_ID]: 40 }),
        ],
      });

      expect(hasHalvedHundredScore(gameSummary, GRACE_ID)).toBe(true);
    });

    test('marks the round a player was halved in', () => {
      expect(getRoundHalving(halvingGame, SECOND_ROUND_ID, GRACE_ID)).toBe(50);
    });

    test('leaves the rounds either side of a halving unmarked', () => {
      expect(getRoundHalving(halvingGame, FIRST_ROUND_ID, GRACE_ID)).toBeNull();
      expect(getRoundHalving(halvingGame, THIRD_ROUND_ID, GRACE_ID)).toBeNull();
    });

    test('leaves a player who was never halved unmarked', () => {
      expect(getRoundHalving(halvingGame, SECOND_ROUND_ID, ADA_ID)).toBeNull();
    });

    test('marks a halving at a hundred separately from one at fifty', () => {
      const gameSummary = deriveGameSummary({
        players: gamePlayers,
        rounds: [
          round(FIRST_ROUND_ID, { [ADA_ID]: 0, [GRACE_ID]: 50 }),
          round(SECOND_ROUND_ID, { [ADA_ID]: 0, [GRACE_ID]: 75 }),
        ],
      });

      expect(getRoundHalving(gameSummary, FIRST_ROUND_ID, GRACE_ID)).toBe(50);
      expect(getRoundHalving(gameSummary, SECOND_ROUND_ID, GRACE_ID)).toBe(100);
    });
  });

  describe('the next halving', () => {
    test('counts a player down towards fifty', () => {
      const summary = deriveGameSummary({
        players: gamePlayers,
        rounds: [round(FIRST_ROUND_ID, { [ADA_ID]: 0, [GRACE_ID]: 30 })],
      });

      expect(getHalvingTarget(summary, GRACE_ID)).toEqual({
        target: 50,
        away: 20,
      });
    });

    test('moves on to a hundred once a player is halved at fifty', () => {
      expect(getHalvingTarget(halvingGame, GRACE_ID)).toEqual({
        target: 100,
        away: 75,
      });
    });

    test('moves on to a hundred once a player has passed fifty unhalved', () => {
      const summary = deriveGameSummary({
        players: gamePlayers,
        rounds: [round(FIRST_ROUND_ID, { [ADA_ID]: 0, [GRACE_ID]: 60 })],
      });

      expect(getHalvingTarget(summary, GRACE_ID)).toEqual({
        target: 100,
        away: 40,
      });
    });

    test('counts past the target for a player who has gone beyond it', () => {
      const summary = deriveGameSummary({
        players: gamePlayers,
        rounds: [round(FIRST_ROUND_ID, { [ADA_ID]: 0, [GRACE_ID]: 101 })],
      });

      expect(getHalvingTarget(summary, GRACE_ID)).toEqual({
        target: 100,
        away: -1,
      });
    });

    test('has nothing left to watch once both halvings are spent', () => {
      const summary = deriveGameSummary({
        players: gamePlayers,
        rounds: [
          round(FIRST_ROUND_ID, { [ADA_ID]: 0, [GRACE_ID]: 50 }),
          round(SECOND_ROUND_ID, { [ADA_ID]: 0, [GRACE_ID]: 75 }),
        ],
      });

      expect(getHalvingTarget(summary, GRACE_ID)).toBeNull();
    });
  });

  describe('winning', () => {
    const wonGame = deriveGameSummary({
      players: gamePlayers,
      rounds: [round(FIRST_ROUND_ID, { [ADA_ID]: 4, [GRACE_ID]: 101 })],
    });

    test('reports the player who won', () => {
      expect(isPlayerWinner(wonGame, ADA_ID)).toBe(true);
    });

    test('reports a player who did not win', () => {
      expect(isPlayerWinner(wonGame, GRACE_ID)).toBe(false);
    });

    test('reports nobody as the winner while the game is still going', () => {
      expect(isPlayerWinner(halvingGame, ADA_ID)).toBe(false);
    });
  });
});
