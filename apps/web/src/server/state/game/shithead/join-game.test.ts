import { beforeEach, describe, expect, test, vi } from 'vitest';
import { buildShitheadLobby } from '~/test-utils/shithead';
import { buildLobbyPlayer, buildYanivLobby } from '~/test-utils/yaniv';
import type { PlayerName, UserId } from '~/types/entities';
import { type GameCode, GameUpdate } from '~/types/game';
import { MAX_PLAYERS } from '~/types/games/shithead';

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

const makeLobby = (playerIds: UserId[]) =>
  buildShitheadLobby({
    code: CODE,
    host: HOST_ID,
    players: playerIds.map((id) =>
      buildLobbyPlayer({ id, name: `Player ${id}` as PlayerName }),
    ),
  });

const fullPlayerIds = Array.from(
  { length: MAX_PLAYERS },
  (_, index) => `player-${index}` as UserId,
);

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

  test('throws when the lobby is for another game', async () => {
    mockGetLobby.mockResolvedValue(
      buildYanivLobby({ players: [buildLobbyPlayer({ id: HOST_ID })] }),
    );

    await expect(joinGame({ code: CODE, userId: USER_ID })).rejects.toThrow(
      'not a Shithead lobby',
    );
  });

  test('returns the players, marking the host and user, when the user is already in the game', async () => {
    mockGetLobby.mockResolvedValue(makeLobby([HOST_ID, USER_ID]));

    const result = await joinGame({ code: CODE, userId: USER_ID });

    expect(result).toEqual({
      update: GameUpdate.LOBBY_UPDATE,
      players: [
        expect.objectContaining({ id: HOST_ID, isHost: true, isUser: false }),
        expect.objectContaining({ id: USER_ID, isHost: false, isUser: true }),
      ],
    });
    expect(mockSetLobby).not.toHaveBeenCalled();
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

  test('says the lobby is full when it has the most players a game allows', async () => {
    mockGetLobby.mockResolvedValue(makeLobby(fullPlayerIds));

    const result = await joinGame({ code: CODE, userId: USER_ID });

    expect(result).toEqual({ update: GameUpdate.LOBBY_FULL });
    expect(mockSetLobby).not.toHaveBeenCalled();
    expect(mockPublishLobbyState).not.toHaveBeenCalled();
  });

  test('adds the player and returns the updated players', async () => {
    const updatedLobby = makeLobby([HOST_ID, USER_ID]);
    mockGetLobby.mockResolvedValue(makeLobby([HOST_ID]));
    mockSetLobby.mockResolvedValue(updatedLobby);

    const result = await joinGame({ code: CODE, userId: USER_ID });

    expect(mockSetLobby).toHaveBeenCalledWith(
      { code: CODE },
      expect.objectContaining({
        players: [
          expect.objectContaining({ id: HOST_ID }),
          expect.objectContaining({
            id: USER_ID,
            name: NEW_PLAYER_NAME,
            isReady: false,
          }),
        ],
      }),
    );
    expect(result).toEqual({
      update: GameUpdate.LOBBY_UPDATE,
      players: expect.arrayContaining([
        expect.objectContaining({ id: USER_ID, isUser: true }),
      ]),
    });
  });

  test('publishes the lobby after a player joins', async () => {
    const updatedLobby = makeLobby([HOST_ID, USER_ID]);
    mockGetLobby.mockResolvedValue(makeLobby([HOST_ID]));
    mockSetLobby.mockResolvedValue(updatedLobby);

    await joinGame({ code: CODE, userId: USER_ID });

    expect(mockPublishLobbyState).toHaveBeenCalledOnce();
    expect(mockPublishLobbyState).toHaveBeenCalledWith(CODE, updatedLobby);
  });
});
