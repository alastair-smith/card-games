import { describe, expect, it } from 'vitest';
import { createDeferred } from '~/test-utils/deferred';
import type { GameCode } from '~/types/game';
import { withLock } from './locks';

describe('withLock', () => {
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

  it('runs tasks for the same namespace of different games concurrently', async () => {
    const events: string[] = [];
    const firstGameTaskRelease = createDeferred();

    const firstGame = withLock('yaniv', 'GAME1' as GameCode, async () => {
      events.push('first game started');
      await firstGameTaskRelease.promise;
    });
    await withLock('yaniv', 'GAME2' as GameCode, async () => {
      events.push('second game started');
    });

    expect(events).toEqual(['first game started', 'second game started']);

    firstGameTaskRelease.resolve();
    await firstGame;
  });
});
