import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { UserId } from '~/types/entities';
import { type GameCode, GameType, GameUpdate } from '~/types/game';
import {
  DEFAULT_HAND_SIZE,
  type HandSize,
  MAX_PLAYERS,
} from '~/types/games/yaniv';

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

const makeLobby = (
  playerIds: UserId[],
  settings: { handSize: HandSize } = { handSize: DEFAULT_HAND_SIZE },
) => ({
  code: CODE,
  type: GameType.YANIV,
  host: HOST_ID,
  settings,
  players: playerIds.map((id) => ({
    id,
    name: `Player ${id}`,
    isReady: false,
  })),
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
      settings: { handSize: DEFAULT_HAND_SIZE },
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
      settings: { handSize: DEFAULT_HAND_SIZE },
    });
  });

  test('returns the hand size the host has chosen', async () => {
    mockGetLobby.mockResolvedValue(
      makeLobby([HOST_ID, USER_ID], { handSize: 7 }),
    );

    const result = await joinGame({ code: CODE, userId: USER_ID });

    expect(result).toMatchObject({ settings: { handSize: 7 } });
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
    const updatedLobby = {
      ...existingLobby,
      players: [
        ...existingLobby.players,
        { id: USER_ID, name: NEW_PLAYER_NAME, isReady: false },
      ],
    };
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
      settings: { handSize: DEFAULT_HAND_SIZE },
    });
  });

  test('publishes the lobby state after a player joins', async () => {
    const existingLobby = makeLobby([HOST_ID]);
    const updatedLobby = {
      ...existingLobby,
      players: [
        ...existingLobby.players,
        { id: USER_ID, name: NEW_PLAYER_NAME, isReady: false },
      ],
    };
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
