import { describe, expect, test } from 'vitest';
import type { PlayerName, UserId } from '~/types/entities';
import type { RoundId, ScoreboardState } from '../_hooks/useYanivScoreboard';
import { deriveGameSummary } from './derive-game-summary';

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
