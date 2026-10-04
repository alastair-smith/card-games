import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { UserId } from '~/types/entities';
import type { GameCode } from '~/types/game';
import { GameType } from '~/types/game';
import { DEFAULT_HAND_SIZE, GameStage } from '~/types/games/yaniv';

const mockLobbyExists = vi.fn();
const mockSetLobby = vi.fn();
const mockSetYanivState = vi.fn();
const mockGenerateLobbyCode = vi.fn();
const mockGeneratePlayerName = vi.fn();

vi.mock('~/server/data/lobby', () => ({
  lobbyExists: mockLobbyExists,
  setLobby: mockSetLobby,
}));

vi.mock('~/server/data/yaniv', () => ({
  setYanivState: mockSetYanivState,
}));

vi.mock('~/server/state/lib/generate-lobby-code', () => ({
  generateLobbyCode: mockGenerateLobbyCode,
}));

vi.mock('~/utils/name-generator', () => ({
  generatePlayerName: mockGeneratePlayerName,
}));

const { createGame } = await import('./create-game');

const HOST = 'user-1' as UserId;
const CODE = 'ABCDEF' as GameCode;
const PLAYER_NAME = 'Cool Penguin' as string;

describe('createGame', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGenerateLobbyCode.mockReturnValue(CODE);
    mockGeneratePlayerName.mockReturnValue(PLAYER_NAME);
    mockLobbyExists.mockResolvedValue(false);
    mockSetLobby.mockResolvedValue({
      code: CODE,
      type: GameType.YANIV,
      host: HOST,
      players: [{ id: HOST, name: PLAYER_NAME, isReady: false }],
    });
    mockSetYanivState.mockResolvedValue({ gameStage: GameStage.LOBBY });
  });

  test('returns the generated game code', async () => {
    const result = await createGame({ host: HOST });
    expect(result).toEqual({ code: CODE });
  });

  test('creates the lobby with the host as first player', async () => {
    await createGame({ host: HOST });
    expect(mockSetLobby).toHaveBeenCalledWith(
      { code: CODE },
      {
        code: CODE,
        type: GameType.YANIV,
        host: HOST,
        settings: { handSize: DEFAULT_HAND_SIZE },
        players: [
          {
            id: HOST,
            name: PLAYER_NAME,
            color: expect.any(String),
            isReady: false,
          },
        ],
        isGameStarted: false,
      },
    );
  });

  test('sets the yaniv game state to LOBBY stage', async () => {
    await createGame({ host: HOST });
    expect(mockSetYanivState).toHaveBeenCalledWith(
      { code: CODE },
      { gameStage: GameStage.LOBBY },
    );
  });

  test('throws when the generated code already exists', async () => {
    mockLobbyExists.mockResolvedValue(true);
    await expect(createGame({ host: HOST })).rejects.toThrow(
      'Error creating game: code already exists',
    );
  });

  test('does not create lobby or state when code already exists', async () => {
    mockLobbyExists.mockResolvedValue(true);
    await expect(createGame({ host: HOST })).rejects.toThrow();
    expect(mockSetLobby).not.toHaveBeenCalled();
    expect(mockSetYanivState).not.toHaveBeenCalled();
  });
});
