import { describe, expect, it } from 'vitest';
import type { GameCode } from '~/types/game';
import { withLock } from './locks';

const createDeferred = () => {
  let resolve: () => void = () => {};
  const promise = new Promise<void>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
};

const flushTasks = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('withLock', () => {
  it('runs tasks for the same namespace and game one at a time', async () => {
    const code = 'SAME' as GameCode;
    const events: string[] = [];
    const firstTaskRelease = createDeferred();

    const first = withLock('yaniv', code, async () => {
      events.push('first started');
      await firstTaskRelease.promise;
      events.push('first finished');
    });
    const second = withLock('yaniv', code, async () => {
      events.push('second started');
    });

    await flushTasks();
    expect(events).toEqual(['first started']);

    firstTaskRelease.resolve();
    await Promise.all([first, second]);

    expect(events).toEqual([
      'first started',
      'first finished',
      'second started',
    ]);
  });

  it('runs tasks for different namespaces of the same game concurrently', async () => {
    const code = 'CONC' as GameCode;
    const events: string[] = [];
    const lobbyTaskRelease = createDeferred();

    const lobbyOnly = withLock('lobby', code, async () => {
      events.push('lobby started');
      await lobbyTaskRelease.promise;
    });
    await withLock('yaniv', code, async () => {
      events.push('yaniv started');
    });

    expect(events).toEqual(['lobby started', 'yaniv started']);

    lobbyTaskRelease.resolve();
    await lobbyOnly;
  });
});
