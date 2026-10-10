import { beforeEach, describe, expect, test, vi } from 'vitest';
import { z } from 'zod';

const mockRedisSet = vi.fn();
const mockTransactionSet = vi.fn();
const mockExec = vi.fn();
const mockTransaction = { set: mockTransactionSet, exec: mockExec };

vi.mock('ioredis', () => ({
  default: class {
    set = mockRedisSet;
    multi = () => mockTransaction;
  },
}));

const { dataLayer, REDIS_EXPIRE_TIME_SECONDS, runTransaction } = await import(
  './redis'
);

const { set } = dataLayer(
  ({ id }: { id: string }) => `thing:${id}`,
  z.object({ name: z.string().min(1) }),
);

const noWrites = async () => {};

describe('set', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('writes straight to redis outside a transaction', async () => {
    await set({ id: 'one' }, { name: 'first' });

    expect(mockRedisSet).toHaveBeenCalledWith(
      'thing:one',
      JSON.stringify({ name: 'first' }),
      'EX',
      REDIS_EXPIRE_TIME_SECONDS,
    );
    expect(mockTransactionSet).not.toHaveBeenCalled();
  });
});

describe('runTransaction', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('runs every queued write in one transaction', async () => {
    mockExec.mockResolvedValue([
      [null, 'OK'],
      [null, 'OK'],
    ]);

    await runTransaction(async (transaction) => {
      await set({ id: 'one' }, { name: 'first' }, transaction);
      await set({ id: 'two' }, { name: 'second' }, transaction);
    });

    expect(mockTransactionSet).toHaveBeenCalledWith(
      'thing:one',
      JSON.stringify({ name: 'first' }),
      'EX',
      REDIS_EXPIRE_TIME_SECONDS,
    );
    expect(mockTransactionSet).toHaveBeenCalledWith(
      'thing:two',
      JSON.stringify({ name: 'second' }),
      'EX',
      REDIS_EXPIRE_TIME_SECONDS,
    );
    expect(mockRedisSet).not.toHaveBeenCalled();
    expect(mockExec).toHaveBeenCalledOnce();
  });

  test('throws when a write in the transaction fails', async () => {
    mockExec.mockResolvedValue([
      [null, 'OK'],
      [new Error('WRONGTYPE'), null],
    ]);

    await expect(runTransaction(noWrites)).rejects.toThrow(
      'Transaction failed',
    );
  });

  test('throws when the transaction is aborted', async () => {
    mockExec.mockResolvedValue(null);

    await expect(runTransaction(noWrites)).rejects.toThrow(
      'Transaction failed',
    );
  });

  test('sends nothing when a queued write is invalid', async () => {
    await expect(
      runTransaction(async (transaction) => {
        await set({ id: 'one' }, { name: 'first' }, transaction);
        await set({ id: 'two' }, { name: '' }, transaction);
      }),
    ).rejects.toThrow('SetData for key: thing:two is invalid.');
    expect(mockExec).not.toHaveBeenCalled();
  });
});
