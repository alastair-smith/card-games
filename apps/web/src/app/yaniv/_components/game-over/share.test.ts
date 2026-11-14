import { describe, expect, test } from 'vitest';
import type { PlayerName, UserId } from '~/types/entities';
import { buildShareData, buildShareText } from './share';

const players = [
  { id: '1' as UserId, name: 'Alice' as PlayerName, score: 20, isWinner: true },
  { id: '2' as UserId, name: 'Bob' as PlayerName, score: 5, isWinner: false },
  {
    id: '3' as UserId,
    name: 'Charlie' as PlayerName,
    score: 100,
    isWinner: false,
  },
];

describe('buildShareText', () => {
  test('zero-pads scores to 3 digits', () => {
    const result = buildShareText([
      {
        id: '1' as UserId,
        name: 'Alice' as PlayerName,
        score: 5,
        isWinner: false,
      },
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

describe('buildShareData', () => {
  test('sets won title when the user is a winner', () => {
    const { title } = buildShareData(players, '1' as UserId, 'example.com');
    expect(title).toBe('I just won a game of Yaniv!');
  });

  test('sets played title when the user did not win', () => {
    const { title } = buildShareData(players, '2' as UserId, 'example.com');
    expect(title).toBe('I just played a game of Yaniv!');
  });

  test('includes the formatted scoreboard as text', () => {
    const { text } = buildShareData(players, '2' as UserId, 'example.com');
    expect(text).toBe(buildShareText(players));
  });

  test('builds the Yaniv game URL from the given host', () => {
    const { url } = buildShareData(
      players,
      '2' as UserId,
      'mygame.example.com',
    );
    expect(url).toBe('https://mygame.example.com/yaniv');
  });
});
