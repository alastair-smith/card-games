import { describe, expect, test } from 'vitest';
import type { PlayerName } from '~/types/entities';
import { buildShareData, buildShareText } from './share-game';

const player = (name: string, total: number, isWinner = false) => ({
  name: name as PlayerName,
  total,
  isWinner,
});

describe('sharing a finished game', () => {
  test('lists every player with their score', () => {
    const text = buildShareText([
      player('Ada', 12, true),
      player('Grace', 104),
    ]);

    expect(text).toBe('012 Ada 🏆\n104 Grace');
  });

  test('pads the scores so they line up', () => {
    const text = buildShareText([player('Ada', 4), player('Grace', 104)]);

    expect(text.split('\n')).toEqual(['004 Ada', '104 Grace']);
  });

  test('marks every winner when a game is tied', () => {
    const text = buildShareText([
      player('Ada', 12, true),
      player('Grace', 12, true),
    ]);

    expect(text).toBe('012 Ada 🏆\n012 Grace 🏆');
  });

  test('points at the game to share it from', () => {
    const shareData = buildShareData([player('Ada', 12, true)], 'example.com');

    expect(shareData.url).toBe('https://example.com/yaniv');
    expect(shareData.title).toBe('We just played a game of Yaniv!');
  });
});
