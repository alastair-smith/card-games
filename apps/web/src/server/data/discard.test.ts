import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Rank, Suit } from '~/types/cards';
import type { GameCode } from '~/types/game';
import type { YanivPlayingCard } from '~/types/games/yaniv';

const mockTransaction = {
  rpush: vi.fn(),
  expire: vi.fn(),
};
const mockRunTransaction = vi.fn();

vi.mock('~/server/data/redis', () => ({
  redis: {},
  runTransaction: mockRunTransaction,
  REDIS_EXPIRE_TIME_SECONDS: 86400,
}));

const { yanivDiscard } = await import('./discard');

const CODE = 'ABCDEF' as GameCode;
const CARD_1: YanivPlayingCard = { suit: Suit.HEARTS, rank: Rank.FIVE };
const CARD_2: YanivPlayingCard = { suit: Suit.SPADES, rank: Rank.SEVEN };

describe('yanivDiscard.pushDiscard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTransaction.rpush.mockReturnValue(mockTransaction);
    mockTransaction.expire.mockReturnValue(mockTransaction);
    mockRunTransaction.mockImplementation(
      async (
        queueWrites: (transaction: typeof mockTransaction) => Promise<void>,
      ) => queueWrites(mockTransaction),
    );
  });

  test('pushes a single card to the discard pile', async () => {
    await yanivDiscard.pushDiscard(CODE, CARD_1);
    expect(mockTransaction.rpush).toHaveBeenCalledOnce();
    expect(mockTransaction.rpush).toHaveBeenCalledWith(
      'discard:yaniv:ABCDEF',
      JSON.stringify(CARD_1),
    );
  });

  test('pushes each card in an array to the discard pile in order', async () => {
    await yanivDiscard.pushDiscard(CODE, [CARD_1, CARD_2]);
    expect(mockTransaction.rpush).toHaveBeenCalledOnce();
    expect(mockTransaction.rpush).toHaveBeenCalledWith(
      'discard:yaniv:ABCDEF',
      JSON.stringify(CARD_1),
      JSON.stringify(CARD_2),
    );
  });

  test('sets the discard pile to expire in the same transaction as the push', async () => {
    await yanivDiscard.pushDiscard(CODE, CARD_1);
    expect(mockRunTransaction).toHaveBeenCalledOnce();
    expect(mockTransaction.expire).toHaveBeenCalledWith(
      'discard:yaniv:ABCDEF',
      86400,
    );
    expect(mockTransaction.rpush).toHaveBeenCalledBefore(
      mockTransaction.expire,
    );
  });

  test('fails when the push fails', async () => {
    mockRunTransaction.mockRejectedValue(new Error('Transaction failed'));
    await expect(yanivDiscard.pushDiscard(CODE, CARD_1)).rejects.toThrow(
      'Transaction failed',
    );
  });

  test('does nothing when there are no cards to push', async () => {
    await yanivDiscard.pushDiscard(CODE, []);
    expect(mockRunTransaction).not.toHaveBeenCalled();
  });
});
