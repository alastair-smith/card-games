import { beforeEach, describe, expect, test, vi } from 'vitest';
import { buildLobbyPlayer, buildYanivLobby } from '~/test-utils/yaniv';
import type { PlayerName, UserId } from '~/types/entities';
import { type GameCode, GameUpdate } from '~/types/game';
import { DEFAULT_SETTINGS, MAX_PLAYERS } from '~/types/games/yaniv';

const mockGetLobby = vi.fn();
const mockSetLobby = vi.fn();
const mockPublishLobbyState = vi.fn();
const mockGeneratePlayerName = vi.fn();

vi.mock('~/server/data/lobby', () => ({
  getLobby: mockGetLobby,
  setLobby: mockSetLobby,
}));

vi.mock('~/server/events/lobby', () => ({
  publishLobbyState: mockPublishLobbyState,
}));

vi.mock('~/utils/name-generator', () => ({
  generatePlayerName: mockGeneratePlayerName,
}));

const { joinGame } = await import('./join-game');

const CODE = 'ABCDEF' as GameCode;
const HOST_ID = 'host-1' as UserId;
const USER_ID = 'user-2' as UserId;
const NEW_PLAYER_NAME = 'Brave Otter';

const makeLobby = (playerIds: UserId[], settings = DEFAULT_SETTINGS) =>
  buildYanivLobby({
    code: CODE,
    host: HOST_ID,
    settings,
    players: playerIds.map((id) =>
      buildLobbyPlayer({ id, name: `Player ${id}` as PlayerName }),
    ),
  });

describe('joinGame', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGeneratePlayerName.mockReturnValue(NEW_PLAYER_NAME);
    mockPublishLobbyState.mockResolvedValue(undefined);
  });

  test('throws when the lobby does not exist', async () => {
    mockGetLobby.mockResolvedValue(null);
    await expect(joinGame({ code: CODE, userId: USER_ID })).rejects.toThrow(
      'lobby not found',
    );
  });

  test('returns lobby state when the user is already in the game', async () => {
    mockGetLobby.mockResolvedValue(makeLobby([HOST_ID, USER_ID]));
    const result = await joinGame({ code: CODE, userId: USER_ID });
    expect(result).toEqual({
      update: GameUpdate.LOBBY_UPDATE,
      players: expect.arrayContaining([
        expect.objectContaining({ id: USER_ID, isUser: true }),
      ]),
      settings: DEFAULT_SETTINGS,
    });
    expect(mockSetLobby).not.toHaveBeenCalled();
  });

  test('marks the host correctly when returning existing player data', async () => {
    mockGetLobby.mockResolvedValue(makeLobby([HOST_ID, USER_ID]));
    const result = await joinGame({ code: CODE, userId: USER_ID });
    expect(result).toEqual({
      update: GameUpdate.LOBBY_UPDATE,
      players: expect.arrayContaining([
        expect.objectContaining({ id: HOST_ID, isHost: true }),
        expect.objectContaining({ id: USER_ID, isHost: false }),
      ]),
      settings: DEFAULT_SETTINGS,
    });
  });

  test('returns the settings the host has chosen', async () => {
    const settings = { handSize: 7, dealer: 'hand-winner' } as const;
    mockGetLobby.mockResolvedValue(makeLobby([HOST_ID, USER_ID], settings));

    const result = await joinGame({ code: CODE, userId: USER_ID });

    expect(result).toMatchObject({ settings });
  });

  test('does not let a new player join once the game has started', async () => {
    mockGetLobby.mockResolvedValue({
      ...makeLobby([HOST_ID]),
      isGameStarted: true,
    });
    const result = await joinGame({ code: CODE, userId: USER_ID });
    expect(result).toEqual({ update: GameUpdate.GAME_NOT_FOUND });
    expect(mockSetLobby).not.toHaveBeenCalled();
    expect(mockPublishLobbyState).not.toHaveBeenCalled();
  });

  test('returns full indicator when at maximum player capacity', async () => {
    const fullPlayerIds = Array.from(
      { length: MAX_PLAYERS },
      (_, i) => `player-${i}` as UserId,
    );
    mockGetLobby.mockResolvedValue(makeLobby(fullPlayerIds));
    const result = await joinGame({ code: CODE, userId: USER_ID });
    expect(result).toEqual({ update: GameUpdate.LOBBY_FULL });
    expect(mockSetLobby).not.toHaveBeenCalled();
  });

  test('adds the player and returns updated lobby state', async () => {
    const existingLobby = makeLobby([HOST_ID]);
    const updatedLobby = makeLobby([HOST_ID, USER_ID]);
    mockGetLobby.mockResolvedValue(existingLobby);
    mockSetLobby.mockResolvedValue(updatedLobby);

    const result = await joinGame({ code: CODE, userId: USER_ID });

    expect(mockSetLobby).toHaveBeenCalledWith(
      { code: CODE },
      expect.objectContaining({
        players: expect.arrayContaining([
          expect.objectContaining({ id: USER_ID, name: NEW_PLAYER_NAME }),
        ]),
      }),
    );
    expect(result).toEqual({
      update: GameUpdate.LOBBY_UPDATE,
      players: expect.arrayContaining([
        expect.objectContaining({ id: USER_ID, isUser: true }),
      ]),
      settings: DEFAULT_SETTINGS,
    });
  });

  test('publishes the lobby state after a player joins', async () => {
    const existingLobby = makeLobby([HOST_ID]);
    const updatedLobby = makeLobby([HOST_ID, USER_ID]);
    mockGetLobby.mockResolvedValue(existingLobby);
    mockSetLobby.mockResolvedValue(updatedLobby);

    await joinGame({ code: CODE, userId: USER_ID });

    expect(mockPublishLobbyState).toHaveBeenCalledOnce();
    expect(mockPublishLobbyState).toHaveBeenCalledWith(CODE, updatedLobby);
  });

  test('does not publish lobby state when game is full', async () => {
    const fullPlayerIds = Array.from(
      { length: MAX_PLAYERS },
      (_, i) => `player-${i}` as UserId,
    );
    mockGetLobby.mockResolvedValue(makeLobby(fullPlayerIds));
    await joinGame({ code: CODE, userId: USER_ID });
    expect(mockPublishLobbyState).not.toHaveBeenCalled();
  });
});
