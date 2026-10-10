import { describe, expect, it } from 'vitest';
import { createDeferred } from '~/test-utils/deferred';
import { createKeyLock } from './key-lock';

describe('createKeyLock', () => {
  it('runs tasks for the same key one at a time in request order', async () => {
    const withLock = createKeyLock();
    const events: string[] = [];
    const firstTaskRelease = createDeferred();

    const first = withLock('lobby', async () => {
      events.push('first started');
      await firstTaskRelease.promise;
      events.push('first finished');
    });
    const second = withLock('lobby', async () => {
      events.push('second started');
    });

    await Promise.resolve();
    expect(events).toEqual(['first started']);

    firstTaskRelease.resolve();
    await Promise.all([first, second]);

    expect(events).toEqual([
      'first started',
      'first finished',
      'second started',
    ]);
  });

  it('runs tasks for different keys concurrently', async () => {
    const withLock = createKeyLock();
    const events: string[] = [];
    const firstTaskRelease = createDeferred();

    const first = withLock('lobby-one', async () => {
      events.push('first started');
      await firstTaskRelease.promise;
    });
    const second = withLock('lobby-two', async () => {
      events.push('second started');
    });

    await second;
    expect(events).toEqual(['first started', 'second started']);

    firstTaskRelease.resolve();
    await first;
  });

  it('keeps running queued tasks after a task fails', async () => {
    const withLock = createKeyLock();

    const failing = withLock('lobby', async () => {
      throw new Error('boom');
    });
    const succeeding = withLock('lobby', async () => 'done');

    await expect(failing).rejects.toThrow('boom');
    await expect(succeeding).resolves.toBe('done');
  });
});
