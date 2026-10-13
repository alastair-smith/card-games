import { describe, expect, test } from 'vitest';
import type { PlayerName, UserId } from '~/types/entities';
import type { RoundId, ScoreboardState } from '../_hooks/useYanivScoreboard';
import {
  deriveGameSummary,
  previewGameSummary,
  previewRound,
} from './derive-game-summary';

const ADA_ID = crypto.randomUUID() as UserId;
const GRACE_ID = crypto.randomUUID() as UserId;

const gamePlayers = [
  { id: ADA_ID, name: 'Ada' as PlayerName },
  { id: GRACE_ID, name: 'Grace' as PlayerName },
];

const round = (
  handTotals: Record<UserId, number>,
  isComplete = true,
): ScoreboardState['rounds'][number] => ({
  id: crypto.randomUUID() as RoundId,
  isComplete,
  handTotals,
});

describe('deriveGameSummary', () => {
  test('starts everyone on nothing', () => {
    const { players } = deriveGameSummary({ players: gamePlayers, rounds: [] });

    expect(players[ADA_ID]?.total).toBe(0);
    expect(players[GRACE_ID]?.total).toBe(0);
  });

  test('adds up the hands across the rounds played', () => {
    const { players } = deriveGameSummary({
      players: gamePlayers,
      rounds: [
        round({ [ADA_ID]: 4, [GRACE_ID]: 20 }),
        round({ [ADA_ID]: 6, [GRACE_ID]: 11 }),
      ],
    });

    expect(players[GRACE_ID]?.total).toBe(31);
  });

  test('takes the scores exactly as the players entered them', () => {
    const { players } = deriveGameSummary({
      players: gamePlayers,
      rounds: [round({ [ADA_ID]: 0, [GRACE_ID]: 25 })],
    });

    expect(players[ADA_ID]?.total).toBe(0);
    expect(players[GRACE_ID]?.total).toBe(25);
  });

  test('scores nothing for a player whose score is yet to be entered', () => {
    const { players } = deriveGameSummary({
      players: gamePlayers,
      rounds: [round({ [GRACE_ID]: 25 })],
    });

    expect(players[ADA_ID]?.total).toBe(0);
  });

  test('halves a total that lands exactly on fifty', () => {
    const { players } = deriveGameSummary({
      players: gamePlayers,
      rounds: [
        round({ [ADA_ID]: 0, [GRACE_ID]: 30 }),
        round({ [ADA_ID]: 0, [GRACE_ID]: 20 }),
      ],
    });

    expect(players[GRACE_ID]?.total).toBe(25);
  });

  test('halves a total that lands exactly on a hundred', () => {
    const { players } = deriveGameSummary({
      players: gamePlayers,
      rounds: [
        round({ [ADA_ID]: 0, [GRACE_ID]: 60 }),
        round({ [ADA_ID]: 0, [GRACE_ID]: 40 }),
      ],
    });

    expect(players[GRACE_ID]?.total).toBe(50);
  });

  test('only halves on fifty once', () => {
    const { players } = deriveGameSummary({
      players: gamePlayers,
      rounds: [
        round({ [ADA_ID]: 0, [GRACE_ID]: 50 }),
        round({ [ADA_ID]: 0, [GRACE_ID]: 25 }),
      ],
    });

    expect(players[GRACE_ID]?.total).toBe(50);
  });

  test('halves a hundred only the once', () => {
    const { players } = deriveGameSummary({
      players: gamePlayers,
      rounds: [round({ [ADA_ID]: 0, [GRACE_ID]: 100 })],
    });

    expect(players[GRACE_ID]?.total).toBe(50);
    expect(players[GRACE_ID]?.isFiftyScoreHalved).toBe(false);
  });

  test('leaves a player put on fifty by their hundred being halved there', () => {
    const { players } = deriveGameSummary({
      players: gamePlayers,
      rounds: [
        round({ [ADA_ID]: 0, [GRACE_ID]: 100 }),
        round({ [ADA_ID]: 5, [GRACE_ID]: 0 }),
      ],
    });

    expect(players[GRACE_ID]?.total).toBe(50);
  });

  test('leaves a total alone for a player who scored nothing', () => {
    const { players } = deriveGameSummary({
      players: gamePlayers,
      rounds: [
        round({ [ADA_ID]: 0, [GRACE_ID]: 50 }),
        round({ [ADA_ID]: 5, [GRACE_ID]: 0 }),
      ],
    });

    // Halved to 25 on reaching 50, and left there by a round they won.
    expect(players[GRACE_ID]?.total).toBe(25);
  });

  test('keeps playing while everyone is a hundred or under', () => {
    const { isGameOver } = deriveGameSummary({
      players: gamePlayers,
      rounds: [round({ [ADA_ID]: 0, [GRACE_ID]: 99 })],
    });

    expect(isGameOver).toBe(false);
  });

  test('ends the game once a player goes over a hundred', () => {
    const { isGameOver } = deriveGameSummary({
      players: gamePlayers,
      rounds: [
        round({ [ADA_ID]: 0, [GRACE_ID]: 99 }),
        round({ [ADA_ID]: 0, [GRACE_ID]: 4 }),
      ],
    });

    expect(isGameOver).toBe(true);
  });

  test('wins the game for the player on the lowest total', () => {
    const { winnerIds } = deriveGameSummary({
      players: gamePlayers,
      rounds: [
        round({ [ADA_ID]: 0, [GRACE_ID]: 99 }),
        round({ [ADA_ID]: 0, [GRACE_ID]: 4 }),
      ],
    });

    expect(winnerIds).toEqual([ADA_ID]);
  });

  test('stops counting rounds played after the game was won', () => {
    const { players } = deriveGameSummary({
      players: gamePlayers,
      rounds: [
        round({ [ADA_ID]: 0, [GRACE_ID]: 101 }),
        round({ [ADA_ID]: 30, [GRACE_ID]: 0 }),
      ],
    });

    expect(players[ADA_ID]?.total).toBe(0);
  });

  test('leaves the round still being entered out of the totals', () => {
    const { players } = deriveGameSummary({
      players: gamePlayers,
      rounds: [
        round({ [ADA_ID]: 0, [GRACE_ID]: 20 }),
        round({ [ADA_ID]: 3, [GRACE_ID]: 9 }, false),
      ],
    });

    expect(players[GRACE_ID]?.total).toBe(20);
  });

  test('counts the round being entered towards a preview of the totals', () => {
    const playedRound = round({ [ADA_ID]: 4, [GRACE_ID]: 30 });
    const roundInProgress = round({ [GRACE_ID]: 6 }, false);
    const gameSummary = deriveGameSummary({
      players: gamePlayers,
      rounds: [playedRound, roundInProgress],
    });

    const preview = previewRound(gameSummary, roundInProgress, gamePlayers);

    expect(preview[GRACE_ID]?.total).toBe(36);
    expect(preview[ADA_ID]?.total).toBe(4);
  });

  test('halves a preview that lands exactly on fifty', () => {
    const playedRound = round({ [ADA_ID]: 0, [GRACE_ID]: 30 });
    const roundInProgress = round({ [GRACE_ID]: 20 }, false);
    const gameSummary = deriveGameSummary({
      players: gamePlayers,
      rounds: [playedRound, roundInProgress],
    });

    const preview = previewRound(gameSummary, roundInProgress, gamePlayers);

    expect(preview[GRACE_ID]?.total).toBe(25);
    expect(preview[GRACE_ID]?.isFiftyScoreHalved).toBe(true);
  });

  test('leaves the game itself untouched by a preview', () => {
    const playedRound = round({ [ADA_ID]: 0, [GRACE_ID]: 30 });
    const roundInProgress = round({ [GRACE_ID]: 20 }, false);
    const gameSummary = deriveGameSummary({
      players: gamePlayers,
      rounds: [playedRound, roundInProgress],
    });

    previewRound(gameSummary, roundInProgress, gamePlayers);

    expect(gameSummary.players[GRACE_ID]?.total).toBe(30);
  });

  test('counts the round being entered into a preview of the whole game', () => {
    const scoreboardState = {
      players: gamePlayers,
      rounds: [
        round({ [ADA_ID]: 4, [GRACE_ID]: 30 }),
        round({ [GRACE_ID]: 6 }, false),
      ],
    };
    const gameSummary = deriveGameSummary(scoreboardState);

    const preview = previewGameSummary(scoreboardState, gameSummary);

    expect(preview.players[GRACE_ID]?.total).toBe(36);
    expect(gameSummary.players[GRACE_ID]?.total).toBe(30);
  });

  test('leaves a game with no round in progress as it stands', () => {
    const scoreboardState = {
      players: gamePlayers,
      rounds: [round({ [ADA_ID]: 4, [GRACE_ID]: 30 })],
    };
    const gameSummary = deriveGameSummary(scoreboardState);

    expect(previewGameSummary(scoreboardState, gameSummary)).toBe(gameSummary);
  });

  test('reworks the totals around a corrected score', () => {
    const firstRound = round({ [ADA_ID]: 0, [GRACE_ID]: 30 });
    const secondRound = round({ [ADA_ID]: 0, [GRACE_ID]: 20 });

    const halved = deriveGameSummary({
      players: gamePlayers,
      rounds: [firstRound, secondRound],
    });
    const corrected = deriveGameSummary({
      players: gamePlayers,
      rounds: [
        firstRound,
        { ...secondRound, handTotals: { [ADA_ID]: 0, [GRACE_ID]: 21 } },
      ],
    });

    expect(halved.players[GRACE_ID]?.total).toBe(25);
    expect(corrected.players[GRACE_ID]?.total).toBe(51);
    expect(corrected.players[GRACE_ID]?.isFiftyScoreHalved).toBe(false);
  });
});
