import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { UserId } from '~/types/entities';
import { type GameCode, GameType } from '~/types/game';
import { GameStage } from '~/types/games/shithead';

const mockLobbyExists = vi.fn();
const mockSetLobby = vi.fn();
const mockSetShitheadState = vi.fn();
const mockGenerateLobbyCode = vi.fn();
const mockGeneratePlayerName = vi.fn();

vi.mock('~/server/data/lobby', () => ({
  lobbyExists: mockLobbyExists,
  setLobby: mockSetLobby,
}));

vi.mock('~/server/data/shithead', () => ({
  setShitheadState: mockSetShitheadState,
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
const PLAYER_NAME = 'Cool Penguin';

describe('createGame', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGenerateLobbyCode.mockReturnValue(CODE);
    mockGeneratePlayerName.mockReturnValue(PLAYER_NAME);
    mockLobbyExists.mockResolvedValue(false);
  });

  test('returns the generated game code', async () => {
    const result = await createGame({ host: HOST });

    expect(result).toEqual({ code: CODE });
  });

  test('creates a Shithead lobby with the host as the first player', async () => {
    await createGame({ host: HOST });

    expect(mockSetLobby).toHaveBeenCalledWith(
      { code: CODE },
      {
        code: CODE,
        type: GameType.SHITHEAD,
        host: HOST,
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

  test('starts the game in the lobby stage', async () => {
    await createGame({ host: HOST });

    expect(mockSetShitheadState).toHaveBeenCalledWith(
      { code: CODE },
      { gameStage: GameStage.LOBBY },
    );
  });

  test('creates neither the lobby nor the game when the code already exists', async () => {
    mockLobbyExists.mockResolvedValue(true);

    await expect(createGame({ host: HOST })).rejects.toThrow(
      'Error creating game: code already exists',
    );
    expect(mockSetLobby).not.toHaveBeenCalled();
    expect(mockSetShitheadState).not.toHaveBeenCalled();
  });
});
