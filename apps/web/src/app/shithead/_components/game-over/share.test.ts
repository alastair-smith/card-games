import { describe, expect, test } from 'vitest';
import { buildClientFinishedPlayer } from '~/test-utils/shithead';
import type { PlayerName } from '~/types/entities';
import { buildShareText } from './share';

describe('buildShareText', () => {
  test('lists the players in finishing order, with a medal for the top three and a place after that', () => {
    const players = [
      buildClientFinishedPlayer({
        name: 'Charlie' as PlayerName,
        finishingPosition: 3,
      }),
      buildClientFinishedPlayer({
        name: 'Eve' as PlayerName,
        finishingPosition: 5,
      }),
      buildClientFinishedPlayer({
        name: 'Alice' as PlayerName,
        finishingPosition: 1,
      }),
      buildClientFinishedPlayer({
        name: 'David' as PlayerName,
        finishingPosition: 4,
      }),
      buildClientFinishedPlayer({
        name: 'Bob' as PlayerName,
        finishingPosition: 2,
      }),
    ];

    expect(buildShareText(players)).toBe(
      '🥇 Alice\n🥈 Bob\n🥉 Charlie\n4th David\n5th Eve',
    );
  });
});
