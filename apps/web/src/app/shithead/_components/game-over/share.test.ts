import { describe, expect, test } from 'vitest';
import type { PlayerName } from '~/types/entities';
import { buildShareData, buildShareText } from './share';

const players = [
  { name: 'Alice' as PlayerName, isUser: false, finishingPosition: 1 },
  { name: 'Bob' as PlayerName, isUser: true, finishingPosition: 2 },
  { name: 'Charlie' as PlayerName, isUser: false, finishingPosition: 3 },
  { name: 'David' as PlayerName, isUser: false, finishingPosition: 4 },
  { name: 'Eve' as PlayerName, isUser: false, finishingPosition: 5 },
] as const;

describe('buildShareText', () => {
  test('lists each player with a medal for the top three and a place after that', () => {
    expect(buildShareText([...players])).toBe(
      '🥇 Alice\n🥈 Bob\n🥉 Charlie\n4th David\n5th Eve',
    );
  });
});

describe('buildShareData', () => {
  test('says the user won when they finished first', () => {
    const { title } = buildShareData(
      [
        { ...players[0], isUser: true },
        { ...players[1], isUser: false },
      ],
      'example.com',
    );
    expect(title).toBe('I just won a game of Shithead!');
  });

  test('says the user played when they did not finish first', () => {
    const { title } = buildShareData([...players], 'example.com');
    expect(title).toBe('I just played a game of Shithead!');
  });

  test('includes the finishing order as text', () => {
    const { text } = buildShareData([...players], 'example.com');
    expect(text).toBe(buildShareText([...players]));
  });

  test('builds the Shithead game URL from the given host', () => {
    const { url } = buildShareData([...players], 'mygame.example.com');
    expect(url).toBe('https://mygame.example.com/shithead');
  });
});
