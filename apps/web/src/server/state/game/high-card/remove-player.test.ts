import { beforeEach, describe, expect, test, vi } from 'vitest';
import { buildLobbyPlayer, buildYanivLobby } from '~/test-utils/yaniv';
import type { UserId } from '~/types/entities';
import type { GameCode } from '~/types/game';

const TRANSACTION = { kind: 'transaction' };

const mockGetLobby = vi.fn();
const mockSetLobby = vi.fn();
const mockDeleteLobby = vi.fn();
const mockDeleteYanivState = vi.fn();
const mockRunTransaction = vi.fn();
const mockEmit = vi.fn();

vi.mock('~/server/data/lobby', () => ({
  getLobby: mockGetLobby,
  setLobby: mockSetLobby,
  deleteLobby: mockDeleteLobby,
}));
vi.mock('~/server/data/yaniv', () => ({
  deleteYanivState: mockDeleteYanivState,
}));
vi.mock('~/server/data/redis', () => ({ runTransaction: mockRunTransaction }));
vi.mock('~/server/events/emitter', () => ({ default: { emit: mockEmit } }));

const { removePlayer } = await import('./remove-player');

const CODE = 'ABCDEF' as GameCode;
const HOST = 'user-1' as UserId;
const PLAYER_2 = 'user-2' as UserId;
const PLAYER_3 = 'user-3' as UserId;

const buildLobbyWith = (playerIds: UserId[]) =>
  buildYanivLobby({
    code: CODE,
    host: HOST,
    players: playerIds.map((id) => buildLobbyPlayer({ id })),
  });

describe('removePlayer', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockRunTransaction.mockImplementation(
      (queueWrites: (transaction: unknown) => Promise<void>) =>
        queueWrites(TRANSACTION),
    );
  });

  describe('when the host leaves', () => {
    test('makes the next player in the lobby the host', async () => {
      mockGetLobby.mockResolvedValue(
        buildLobbyWith([HOST, PLAYER_2, PLAYER_3]),
      );

      await removePlayer({ gameCode: CODE, actor: HOST, target: HOST });

      expect(mockSetLobby).toHaveBeenCalledWith(
        { code: CODE },
        expect.objectContaining({
          host: PLAYER_2,
          players: [
            expect.objectContaining({ id: PLAYER_2 }),
            expect.objectContaining({ id: PLAYER_3 }),
          ],
        }),
      );
    });

    test('tells the remaining players who the new host is', async () => {
      mockGetLobby.mockResolvedValue(buildLobbyWith([HOST, PLAYER_2]));

      await removePlayer({ gameCode: CODE, actor: HOST, target: HOST });

      expect(mockEmit).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ host: PLAYER_2 }),
      );
    });
  });

  test('keeps the host when another player leaves', async () => {
    mockGetLobby.mockResolvedValue(buildLobbyWith([HOST, PLAYER_2]));

    await removePlayer({ gameCode: CODE, actor: PLAYER_2, target: PLAYER_2 });

    expect(mockSetLobby).toHaveBeenCalledWith(
      { code: CODE },
      expect.objectContaining({ host: HOST }),
    );
  });

  test('keeps the host when the host removes another player', async () => {
    mockGetLobby.mockResolvedValue(buildLobbyWith([HOST, PLAYER_2]));

    await removePlayer({ gameCode: CODE, actor: HOST, target: PLAYER_2 });

    expect(mockSetLobby).toHaveBeenCalledWith(
      { code: CODE },
      expect.objectContaining({ host: HOST }),
    );
  });

  describe('when the last player leaves', () => {
    beforeEach(() => {
      mockGetLobby.mockResolvedValue(buildLobbyWith([HOST]));
    });

    test('deletes the lobby and its game together', async () => {
      await removePlayer({ gameCode: CODE, actor: HOST, target: HOST });

      expect(mockDeleteLobby).toHaveBeenCalledWith({ code: CODE }, TRANSACTION);
      expect(mockDeleteYanivState).toHaveBeenCalledWith(
        { code: CODE },
        TRANSACTION,
      );
      expect(mockRunTransaction).toHaveBeenCalledOnce();
      expect(mockSetLobby).not.toHaveBeenCalled();
    });

    test('still tells the leaving player they have left', async () => {
      await removePlayer({ gameCode: CODE, actor: HOST, target: HOST });

      expect(mockEmit).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ players: [] }),
      );
    });
  });
});
