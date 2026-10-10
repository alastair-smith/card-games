import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { UserId } from '~/types/entities';
import { type GameCode, GameType } from '~/types/game';

const mockGetLobby = vi.fn();
const mockSetLobby = vi.fn();
const mockPublishLobbyState = vi.fn();

vi.mock('~/server/data/lobby', () => ({
  getLobby: mockGetLobby,
  setLobby: mockSetLobby,
}));

vi.mock('~/server/events/lobby', () => ({
  publishLobbyState: mockPublishLobbyState,
}));

const { updatePlayerState } = await import('./update-player-state');

const CODE = 'ABCDEF' as GameCode;
const USER_ID = 'user-1' as UserId;
const OTHER_ID = 'user-2' as UserId;

const makeLobby = () => ({
  code: CODE,
  type: GameType.YANIV,
  host: USER_ID,
  players: [
    { id: USER_ID, name: 'Player 1', color: 'red', isReady: false },
    { id: OTHER_ID, name: 'Player 2', color: 'cyan', isReady: false },
  ],
  isGameStarted: false,
});

describe('updatePlayerState', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetLobby.mockResolvedValue(makeLobby());
    mockSetLobby.mockImplementation((_, lobby) => Promise.resolve(lobby));
    mockPublishLobbyState.mockResolvedValue(undefined);
  });

  test('throws when the lobby does not exist', async () => {
    mockGetLobby.mockResolvedValue(null);
    await expect(
      updatePlayerState({
        code: CODE,
        userId: USER_ID,
        field: 'name',
        value: 'Sam',
      }),
    ).rejects.toThrow('lobby not found');
  });

  test('throws when the game has already started', async () => {
    mockGetLobby.mockResolvedValue({ ...makeLobby(), isGameStarted: true });
    await expect(
      updatePlayerState({
        code: CODE,
        userId: USER_ID,
        field: 'isReady',
        value: true,
      }),
    ).rejects.toThrow('game has already started');
    expect(mockSetLobby).not.toHaveBeenCalled();
  });

  test('throws when the player is not in the lobby', async () => {
    await expect(
      updatePlayerState({
        code: CODE,
        userId: 'ghost' as UserId,
        field: 'name',
        value: 'Sam',
      }),
    ).rejects.toThrow('player not in game');
  });

  describe('colour', () => {
    test('rejects a colour already taken by another player', async () => {
      await expect(
        updatePlayerState({
          code: CODE,
          userId: USER_ID,
          field: 'color',
          value: 'cyan',
        }),
      ).rejects.toThrow('colour already taken');
      expect(mockSetLobby).not.toHaveBeenCalled();
    });

    test('saves a colour no other player is using', async () => {
      await updatePlayerState({
        code: CODE,
        userId: USER_ID,
        field: 'color',
        value: 'green',
      });
      expect(mockSetLobby).toHaveBeenCalledWith(
        { code: CODE },
        expect.objectContaining({
          players: expect.arrayContaining([
            expect.objectContaining({ id: USER_ID, color: 'green' }),
          ]),
        }),
      );
    });

    test('allows re-selecting the colour the player already has', async () => {
      await expect(
        updatePlayerState({
          code: CODE,
          userId: USER_ID,
          field: 'color',
          value: 'red',
        }),
      ).resolves.toBeDefined();
      expect(mockSetLobby).toHaveBeenCalled();
    });
  });

  test('saves other field updates and publishes the new state', async () => {
    await updatePlayerState({
      code: CODE,
      userId: USER_ID,
      field: 'isReady',
      value: true,
    });
    expect(mockSetLobby).toHaveBeenCalledWith(
      { code: CODE },
      expect.objectContaining({
        players: expect.arrayContaining([
          expect.objectContaining({ id: USER_ID, isReady: true }),
        ]),
      }),
    );
    expect(mockPublishLobbyState).toHaveBeenCalledOnce();
  });
});
