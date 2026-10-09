import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDeferred } from '~/test-utils/deferred';
import { createKeyLock } from './key-lock';

const TIMEOUT_MS = 1_000;

describe('createKeyLock', () => {
  it('runs tasks for the same key one at a time in request order', async () => {
    const withLock = createKeyLock({ timeoutMs: TIMEOUT_MS });
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
    const withLock = createKeyLock({ timeoutMs: TIMEOUT_MS });
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
    const withLock = createKeyLock({ timeoutMs: TIMEOUT_MS });

    const failing = withLock('lobby', async () => {
      throw new Error('boom');
    });
    const succeeding = withLock('lobby', async () => 'done');

    await expect(failing).rejects.toThrow('boom');
    await expect(succeeding).resolves.toBe('done');
  });

  describe('timeout', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it('rejects a task that runs past the timeout and runs the next queued task', async () => {
      vi.useFakeTimers();
      const withLock = createKeyLock({ timeoutMs: TIMEOUT_MS });
      const neverReleased = createDeferred();

      const hung = withLock('lobby', () => neverReleased.promise);
      const hungRejection = expect(hung).rejects.toThrow(
        `Lock on lobby timed out after ${TIMEOUT_MS}ms`,
      );
      const queued = withLock('lobby', async () => 'done');

      await vi.advanceTimersByTimeAsync(TIMEOUT_MS);

      await hungRejection;
      await expect(queued).resolves.toBe('done');
    });

    it('times each task from when it starts, not from when it was queued', async () => {
      vi.useFakeTimers();
      const withLock = createKeyLock({ timeoutMs: TIMEOUT_MS });
      const firstTaskRelease = createDeferred();
      const secondTaskRelease = createDeferred();

      const first = withLock('lobby', () => firstTaskRelease.promise);
      const second = withLock('lobby', async () => {
        await secondTaskRelease.promise;
        return 'done';
      });

      await vi.advanceTimersByTimeAsync(TIMEOUT_MS - 1);
      firstTaskRelease.resolve();
      await first;
      await vi.advanceTimersByTimeAsync(TIMEOUT_MS - 1);
      secondTaskRelease.resolve();

      await expect(second).resolves.toBe('done');
    });
  });
});
