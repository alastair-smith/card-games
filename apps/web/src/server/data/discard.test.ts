import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Rank, Suit } from '~/types/cards';
import type { GameCode } from '~/types/game';
import type { YanivPlayingCard } from '~/types/games/yaniv';

const mockRpush = vi.fn();

vi.mock('~/server/data/redis', () => ({
  redis: {
    rpush: mockRpush,
    pipeline: vi.fn(() => ({ del: vi.fn(), expire: vi.fn(), exec: vi.fn() })),
    rpop: vi.fn(),
    lindex: vi.fn(),
    exists: vi.fn(),
    llen: vi.fn(),
  },
  REDIS_EXPIRE_TIME_SECONDS: 86400,
}));

const { yanivDiscard } = await import('./discard');

const CODE = 'ABCDEF' as GameCode;
const CARD_1: YanivPlayingCard = { suit: Suit.HEARTS, rank: Rank.FIVE };
const CARD_2: YanivPlayingCard = { suit: Suit.SPADES, rank: Rank.SEVEN };

describe('yanivDiscard.pushDiscard', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockRpush.mockResolvedValue(1);
  });

  test('pushes a single card to the discard pile', async () => {
    await yanivDiscard.pushDiscard(CODE, CARD_1);
    expect(mockRpush).toHaveBeenCalledOnce();
    expect(mockRpush).toHaveBeenCalledWith(
      'discard:yaniv:ABCDEF',
      JSON.stringify(CARD_1),
    );
  });

  test('pushes each card in an array to the discard pile in order', async () => {
    await yanivDiscard.pushDiscard(CODE, [CARD_1, CARD_2]);
    expect(mockRpush).toHaveBeenCalledTimes(2);
    expect(mockRpush).toHaveBeenNthCalledWith(
      1,
      'discard:yaniv:ABCDEF',
      JSON.stringify(CARD_1),
    );
    expect(mockRpush).toHaveBeenNthCalledWith(
      2,
      'discard:yaniv:ABCDEF',
      JSON.stringify(CARD_2),
    );
  });
});
