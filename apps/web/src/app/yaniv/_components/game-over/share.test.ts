import { describe, expect, test } from 'vitest';
import type { PlayerName } from '~/types/entities';
import { buildShareText } from './share';

const players = [
  { name: 'Alice' as PlayerName, score: 20, isWinner: true },
  { name: 'Bob' as PlayerName, score: 5, isWinner: false },
  { name: 'Charlie' as PlayerName, score: 100, isWinner: false },
];

describe('buildShareText', () => {
  test('zero-pads scores to 3 digits', () => {
    const result = buildShareText([
      { name: 'Alice' as PlayerName, score: 5, isWinner: false },
    ]);
    expect(result).toContain('005');
  });

  test('appends trophy emoji to winners', () => {
    const result = buildShareText(players);
    expect(result).toContain('Alice 🏆');
  });

  test('does not append trophy emoji to non-winners', () => {
    const result = buildShareText(players);
    expect(result).not.toContain('Bob 🏆');
    expect(result).not.toContain('Charlie 🏆');
  });

  test('joins players with newlines', () => {
    const result = buildShareText(players);
    expect(result).toBe('020 Alice 🏆\n005 Bob\n100 Charlie');
  });
});
