import { beforeEach, describe, expect, test, vi } from 'vitest';
import { z } from 'zod';

const mockSet = vi.fn();
const mockExec = vi.fn();
const mockTransaction = { set: mockSet, exec: mockExec };

vi.mock('ioredis', () => ({
  default: class {
    multi = () => mockTransaction;
  },
}));

const { dataLayer, REDIS_EXPIRE_TIME_SECONDS, runTransaction } = await import(
  './redis'
);

const { queueSet } = dataLayer(
  ({ id }: { id: string }) => `thing:${id}`,
  z.object({ name: z.string().min(1) }),
);

describe('runTransaction', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('runs every queued write in one transaction', async () => {
    mockExec.mockResolvedValue([
      [null, 'OK'],
      [null, 'OK'],
    ]);

    await runTransaction((transaction) => {
      queueSet(transaction, { id: 'one' }, { name: 'first' });
      queueSet(transaction, { id: 'two' }, { name: 'second' });
    });

    expect(mockSet).toHaveBeenCalledWith(
      'thing:one',
      JSON.stringify({ name: 'first' }),
      'EX',
      REDIS_EXPIRE_TIME_SECONDS,
    );
    expect(mockSet).toHaveBeenCalledWith(
      'thing:two',
      JSON.stringify({ name: 'second' }),
      'EX',
      REDIS_EXPIRE_TIME_SECONDS,
    );
    expect(mockExec).toHaveBeenCalledOnce();
  });

  test('throws when a write in the transaction fails', async () => {
    mockExec.mockResolvedValue([
      [null, 'OK'],
      [new Error('WRONGTYPE'), null],
    ]);

    await expect(runTransaction(() => {})).rejects.toThrow(
      'Transaction failed',
    );
  });

  test('throws when the transaction is aborted', async () => {
    mockExec.mockResolvedValue(null);

    await expect(runTransaction(() => {})).rejects.toThrow(
      'Transaction failed',
    );
  });

  test('sends nothing when a queued write is invalid', async () => {
    await expect(
      runTransaction((transaction) => {
        queueSet(transaction, { id: 'one' }, { name: 'first' });
        queueSet(transaction, { id: 'two' }, { name: '' });
      }),
    ).rejects.toThrow('SetData for key: thing:two is invalid.');
    expect(mockExec).not.toHaveBeenCalled();
  });
});
