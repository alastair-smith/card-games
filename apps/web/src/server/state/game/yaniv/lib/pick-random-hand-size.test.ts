import { afterEach, describe, expect, test, vi } from 'vitest';
import { pickRandomHandSize } from './pick-random-hand-size';

describe('pickRandomHandSize', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('can pick the fewest cards in the range', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    expect(pickRandomHandSize({ min: 1, max: 7 })).toBe(1);
  });

  test('can pick the most cards in the range', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999_999);

    expect(pickRandomHandSize({ min: 1, max: 7 })).toBe(7);
  });

  test('picks from the middle of the range for a random number halfway up', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    expect(pickRandomHandSize({ min: 3, max: 6 })).toBe(5);
  });

  test('always picks the one size when both ends of the range are the same', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999_999);

    expect(pickRandomHandSize({ min: 4, max: 4 })).toBe(4);
  });
});
