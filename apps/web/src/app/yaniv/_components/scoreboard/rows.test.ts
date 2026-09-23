import { describe, expect, test } from 'vitest';
import { buildClientPlayer } from '~/test-utils/yaniv';
import type { PlayerName, UserId } from '~/types/entities';
import { toScoreboardRows } from './rows';

const roundScore = (
  original: number,
  adjusted = original,
  isScoreHalved = false,
) => ({ original, adjusted, isScoreHalved });

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

  describe('round changes', () => {
    test('keeps the points scored in each round', () => {
      const [row] = toScoreboardRows(
        [
          buildClientPlayer({
            roundScores: [roundScore(12), roundScore(7, 25)],
          }),
        ],
        '1' as UserId,
      );
      expect(row?.roundChanges).toEqual([
        { adjusted: 12, halvedBy: 0 },
        { adjusted: 25, halvedBy: 0 },
      ]);
    });

    test('works out the drop when a score is halved on 50', () => {
      const [row] = toScoreboardRows(
        [
          buildClientPlayer({
            roundScores: [roundScore(40), roundScore(10, 10, true)],
          }),
        ],
        '1' as UserId,
      );
      expect(row?.roundChanges.at(-1)).toEqual({ adjusted: 10, halvedBy: 25 });
    });

    test('works out the drop when a score is halved on 100', () => {
      const [row] = toScoreboardRows(
        [
          buildClientPlayer({
            roundScores: [
              roundScore(40),
              roundScore(10, 10, true),
              roundScore(45),
              roundScore(30, 30, true),
            ],
          }),
        ],
        '1' as UserId,
      );
      expect(row?.roundChanges.at(-1)).toEqual({ adjusted: 30, halvedBy: 50 });
    });
  });
});
