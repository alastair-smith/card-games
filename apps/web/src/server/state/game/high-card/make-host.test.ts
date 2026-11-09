import { beforeEach, describe, expect, test, vi } from 'vitest';
import { buildShitheadLobby } from '~/test-utils/shithead';
import { buildLobbyPlayer } from '~/test-utils/yaniv';
import type { UserId } from '~/types/entities';
import type { GameCode } from '~/types/game';

const mockGetLobby = vi.fn();
const mockSetLobby = vi.fn();
const mockEmit = vi.fn();

vi.mock('~/server/data/lobby', () => ({
  getLobby: mockGetLobby,
  setLobby: mockSetLobby,
}));
vi.mock('~/server/events/emitter', () => ({ default: { emit: mockEmit } }));

const { makeHost } = await import('./make-host');

const CODE = 'ABCDEF' as GameCode;
const HOST = 'user-1' as UserId;
const PLAYER_2 = 'user-2' as UserId;

const buildLobby = (isGameStarted: boolean) =>
  buildShitheadLobby({
    code: CODE,
    host: HOST,
    isGameStarted,
    players: [
      buildLobbyPlayer({ id: HOST }),
      buildLobbyPlayer({ id: PLAYER_2 }),
    ],
  });

describe('makeHost in a Shithead lobby', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('transfers the host before the game starts', async () => {
    mockGetLobby.mockResolvedValue(buildLobby(false));

    await makeHost({ gameCode: CODE, target: PLAYER_2, actor: HOST });

    expect(mockSetLobby).toHaveBeenCalledWith(
      { code: CODE },
      expect.objectContaining({ host: PLAYER_2 }),
    );
  });

  test('refuses once the game has started', async () => {
    mockGetLobby.mockResolvedValue(buildLobby(true));

    await expect(
      makeHost({ gameCode: CODE, target: PLAYER_2, actor: HOST }),
    ).rejects.toThrow('The game has already started.');
    expect(mockSetLobby).not.toHaveBeenCalled();
  });
});
