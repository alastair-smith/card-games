import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Rank, Suit } from '~/types/cards';
import type { GameCode } from '~/types/game';
import type { YanivPlayingCard } from '~/types/games/yaniv';

const mockPipeline = {
  rpush: vi.fn(),
  expire: vi.fn(),
  exec: vi.fn(),
};

vi.mock('~/server/data/redis', () => ({
  redis: {
    pipeline: vi.fn(() => mockPipeline),
  },
  REDIS_EXPIRE_TIME_SECONDS: 86400,
}));

const { yanivDiscard } = await import('./discard');

const CODE = 'ABCDEF' as GameCode;
const CARD_1: YanivPlayingCard = { suit: Suit.HEARTS, rank: Rank.FIVE };
const CARD_2: YanivPlayingCard = { suit: Suit.SPADES, rank: Rank.SEVEN };

describe('yanivDiscard.pushDiscard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPipeline.rpush.mockReturnValue(mockPipeline);
    mockPipeline.expire.mockReturnValue(mockPipeline);
    mockPipeline.exec.mockResolvedValue([]);
  });

  test('pushes a single card to the discard pile', async () => {
    await yanivDiscard.pushDiscard(CODE, CARD_1);
    expect(mockPipeline.rpush).toHaveBeenCalledOnce();
    expect(mockPipeline.rpush).toHaveBeenCalledWith(
      'discard:yaniv:ABCDEF',
      JSON.stringify(CARD_1),
    );
  });

  test('pushes each card in an array to the discard pile in order', async () => {
    await yanivDiscard.pushDiscard(CODE, [CARD_1, CARD_2]);
    expect(mockPipeline.rpush).toHaveBeenCalledOnce();
    expect(mockPipeline.rpush).toHaveBeenCalledWith(
      'discard:yaniv:ABCDEF',
      JSON.stringify(CARD_1),
      JSON.stringify(CARD_2),
    );
  });

  test('sets the discard pile to expire after pushing', async () => {
    await yanivDiscard.pushDiscard(CODE, CARD_1);
    expect(mockPipeline.expire).toHaveBeenCalledWith(
      'discard:yaniv:ABCDEF',
      86400,
    );
    expect(mockPipeline.rpush).toHaveBeenCalledBefore(mockPipeline.expire);
    expect(mockPipeline.exec).toHaveBeenCalledOnce();
  });

  test('does nothing when there are no cards to push', async () => {
    await yanivDiscard.pushDiscard(CODE, []);
    expect(mockPipeline.exec).not.toHaveBeenCalled();
  });
});
