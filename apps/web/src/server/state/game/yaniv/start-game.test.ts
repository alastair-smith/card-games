import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { UserId } from '~/types/entities';
import type { GameCode } from '~/types/game';
import { GameStage, GameStep } from '~/types/games/yaniv';

const mockGetLobby = vi.fn();
const mockSetYanivState = vi.fn();
const mockPublishYanivState = vi.fn();
const mockCreateDeck = vi.fn();
const mockDrawCard = vi.fn();
const mockCreateDiscard = vi.fn();
const mockPushDiscard = vi.fn();

vi.mock('~/server/data/lobby', () => ({ getLobby: mockGetLobby }));
vi.mock('~/server/data/yaniv', () => ({ setYanivState: mockSetYanivState }));
vi.mock('~/server/events/yaniv', () => ({
  publishYanivState: mockPublishYanivState,
}));
vi.mock('~/server/data/deck', () => ({
  yanivDeck: { createDeck: mockCreateDeck, drawCard: mockDrawCard },
}));
vi.mock('~/server/data/discard', () => ({
  yanivDiscard: {
    createDiscard: mockCreateDiscard,
    pushDiscard: mockPushDiscard,
  },
}));
vi.mock('~/utils/cards/index', () => ({ shuffle: (deck: unknown[]) => deck }));

const { startGame } = await import('./start-game');

const CODE = 'ABCDEF' as GameCode;
const HOST = 'user-1' as UserId;
const PLAYER_2 = 'user-2' as UserId;

const makeLobby = (players = [HOST, PLAYER_2]) => ({
  code: CODE,
  host: HOST,
  players: players.map((id) => ({ id, name: `Player ${id}`, isReady: true })),
});

const makeCard = (i: number) => ({ suit: 'hearts', rank: i + 2 });

describe('startGame', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetLobby.mockResolvedValue(makeLobby());
    mockSetYanivState.mockResolvedValue(undefined);
    mockPublishYanivState.mockResolvedValue(undefined);
    mockCreateDeck.mockResolvedValue(undefined);
    mockCreateDiscard.mockResolvedValue(undefined);
    mockPushDiscard.mockResolvedValue(undefined);
    // Return a unique card per call
    let callCount = 0;
    mockDrawCard.mockImplementation(() =>
      Promise.resolve(makeCard(callCount++)),
    );
  });

  test('throws when lobby not found', async () => {
    mockGetLobby.mockResolvedValue(null);
    await expect(startGame(CODE, HOST)).rejects.toThrow('Lobby not found');
  });

  test('throws when caller is not the host', async () => {
    await expect(startGame(CODE, PLAYER_2)).rejects.toThrow(
      'Only the host can start the game',
    );
  });

  test('throws when fewer than 2 players', async () => {
    mockGetLobby.mockResolvedValue(makeLobby([HOST]));
    await expect(startGame(CODE, HOST)).rejects.toThrow(
      'Not enough players to start the game',
    );
  });

  test('creates a shuffled deck', async () => {
    await startGame(CODE, HOST);
    expect(mockCreateDeck).toHaveBeenCalledOnce();
    expect(mockCreateDeck).toHaveBeenCalledWith(
      CODE,
      expect.arrayContaining([]),
    );
    const deck = mockCreateDeck.mock.calls[0]?.[1] as unknown[];
    expect(deck).toHaveLength(54);
  });

  test('deals exactly 5 cards to each player', async () => {
    await startGame(CODE, HOST);
    expect(mockSetYanivState).toHaveBeenCalledOnce();
    const state = mockSetYanivState.mock.calls[0]?.[1] as {
      hands: Record<string, unknown[]>;
    };
    expect(state.hands[HOST]).toHaveLength(5);
    expect(state.hands[PLAYER_2]).toHaveLength(5);
  });

  test('sets card count to 5 for each player', async () => {
    await startGame(CODE, HOST);
    const state = mockSetYanivState.mock.calls[0]?.[1] as {
      players: Array<{ cardCount: number }>;
    };
    for (const player of state.players) {
      expect(player.cardCount).toBe(5);
    }
  });

  test('seeds the discard pile with one card', async () => {
    await startGame(CODE, HOST);
    expect(mockCreateDiscard).toHaveBeenCalledOnce();
    expect(mockPushDiscard).toHaveBeenCalledOnce();
    expect(mockPushDiscard).toHaveBeenCalledWith(CODE, expect.anything());
  });

  test('draws 11 cards total (5 per player × 2 + 1 for discard)', async () => {
    await startGame(CODE, HOST);
    expect(mockDrawCard).toHaveBeenCalledTimes(11);
  });

  test('persists state as IN_PROGRESS with PLAY_CARDS step', async () => {
    await startGame(CODE, HOST);
    expect(mockSetYanivState).toHaveBeenCalledOnce();
    expect(mockSetYanivState).toHaveBeenCalledWith(
      { code: CODE },
      expect.objectContaining({
        gameStage: GameStage.IN_PROGRESS,
        gameStep: GameStep.PLAY_CARDS,
        currentPlayerId: HOST,
        playedCards: [],
      }),
    );
  });

  test('publishes the state after persisting', async () => {
    await startGame(CODE, HOST);
    expect(mockPublishYanivState).toHaveBeenCalledOnce();
    expect(mockPublishYanivState).toHaveBeenCalledWith(
      CODE,
      expect.objectContaining({ gameStage: GameStage.IN_PROGRESS }),
    );
  });
});
