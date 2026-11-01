import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { UserId } from '~/types/entities';
import { type GameCode, GameType } from '~/types/game';
import {
  DEFAULT_SETTINGS,
  RANDOM_HAND_SIZE,
  type Settings,
} from '~/types/games/yaniv';

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

const { updateSettings } = await import('./update-settings');

const CODE = 'ABCDEF' as GameCode;
const HOST_ID = 'host-1' as UserId;
const USER_ID = 'user-2' as UserId;
const SEVEN_CARD_SETTINGS: Settings = { ...DEFAULT_SETTINGS, handSize: 7 };

const makeLobby = () => ({
  code: CODE,
  type: GameType.YANIV,
  host: HOST_ID,
  settings: DEFAULT_SETTINGS,
  players: [HOST_ID, USER_ID].map((id) => ({
    id,
    name: `Player ${id}`,
    isReady: false,
  })),
  isGameStarted: false,
});

describe('updateSettings', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetLobby.mockResolvedValue(makeLobby());
    mockSetLobby.mockImplementation((_keyArgs, lobby) =>
      Promise.resolve(lobby),
    );
    mockPublishLobbyState.mockResolvedValue(undefined);
  });

  test('throws when the lobby does not exist', async () => {
    mockGetLobby.mockResolvedValue(null);

    await expect(
      updateSettings({
        code: CODE,
        userId: HOST_ID,
        settings: SEVEN_CARD_SETTINGS,
      }),
    ).rejects.toThrow('lobby not found');
  });

  test('throws when someone other than the host changes the settings', async () => {
    await expect(
      updateSettings({
        code: CODE,
        userId: USER_ID,
        settings: SEVEN_CARD_SETTINGS,
      }),
    ).rejects.toThrow('only the host can change the settings');

    expect(mockSetLobby).not.toHaveBeenCalled();
  });

  test('throws when the game has already started', async () => {
    mockGetLobby.mockResolvedValue({ ...makeLobby(), isGameStarted: true });

    await expect(
      updateSettings({
        code: CODE,
        userId: HOST_ID,
        settings: SEVEN_CARD_SETTINGS,
      }),
    ).rejects.toThrow('game has already started');

    expect(mockSetLobby).not.toHaveBeenCalled();
  });

  test('saves the hand size the host chose', async () => {
    await updateSettings({
      code: CODE,
      userId: HOST_ID,
      settings: SEVEN_CARD_SETTINGS,
    });

    expect(mockSetLobby).toHaveBeenCalledOnce();
    expect(mockSetLobby).toHaveBeenCalledWith(
      { code: CODE },
      expect.objectContaining({ settings: SEVEN_CARD_SETTINGS }),
    );
  });

  test('saves the random hand size range the host chose', async () => {
    const randomSettings: Settings = {
      handSize: RANDOM_HAND_SIZE,
      handSizeRange: { min: 2, max: 9 },
    };

    await updateSettings({
      code: CODE,
      userId: HOST_ID,
      settings: randomSettings,
    });

    expect(mockSetLobby).toHaveBeenCalledWith(
      { code: CODE },
      expect.objectContaining({ settings: randomSettings }),
    );
  });

  test('leaves the rest of the lobby untouched', async () => {
    await updateSettings({
      code: CODE,
      userId: HOST_ID,
      settings: SEVEN_CARD_SETTINGS,
    });

    expect(mockSetLobby).toHaveBeenCalledWith(
      { code: CODE },
      expect.objectContaining({
        code: CODE,
        host: HOST_ID,
        players: makeLobby().players,
      }),
    );
  });

  test('tells the other players about the change', async () => {
    await updateSettings({
      code: CODE,
      userId: HOST_ID,
      settings: SEVEN_CARD_SETTINGS,
    });

    expect(mockPublishLobbyState).toHaveBeenCalledOnce();
    expect(mockPublishLobbyState).toHaveBeenCalledWith(
      CODE,
      expect.objectContaining({ settings: SEVEN_CARD_SETTINGS }),
    );
  });
});
