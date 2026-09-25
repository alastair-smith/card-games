import { describe, expect, test } from 'vitest';
import { buildClientPlayer, buildRoundScore } from '~/test-utils/yaniv';
import type { PlayerName, UserId } from '~/types/entities';
import { toScoreboardRows } from './rows';

describe('toScoreboardRows', () => {
  describe('ordering', () => {
    test('orders players from lowest total score to highest', () => {
      const rows = toScoreboardRows(
        [
          buildClientPlayer({ id: '1' as UserId, score: 30 }),
          buildClientPlayer({ id: '2' as UserId, score: 8 }),
          buildClientPlayer({ id: '3' as UserId, score: 12 }),
        ],
        '1' as UserId,
      );
      expect(rows.map(({ id }) => id)).toEqual(['2', '3', '1']);
    });
  });

  describe('current user', () => {
    test('marks only the current user', () => {
      const rows = toScoreboardRows(
        [
          buildClientPlayer({ id: '1' as UserId, name: 'Alice' as PlayerName }),
          buildClientPlayer({ id: '2' as UserId, name: 'Bob' as PlayerName }),
        ],
        '2' as UserId,
      );
      expect(rows.map(({ name, isUser }) => [name, isUser])).toEqual([
        ['Alice', false],
        ['Bob', true],
      ]);
    });
  });

  describe('round scores', () => {
    test('keeps each round score for the player', () => {
      const roundScores = [
        buildRoundScore({ original: 40 }),
        buildRoundScore({ original: 10, halvedBy: 25 }),
      ];
      const [row] = toScoreboardRows(
        [buildClientPlayer({ roundScores })],
        '1' as UserId,
      );
      expect(row?.roundScores).toEqual(roundScores);
    });
  });
});
