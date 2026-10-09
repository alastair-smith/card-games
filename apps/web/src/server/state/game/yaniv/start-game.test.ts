import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { UserId } from '~/types/entities';
import { type GameCode, GameType } from '~/types/game';
import {
  DEFAULT_HAND_SIZE,
  GameStage,
  GameStep,
  type HandSize,
  MAX_PLAYERS,
} from '~/types/games/yaniv';

const TRANSACTION = { kind: 'transaction' };

const mockGetLobby = vi.fn();
const mockQueueSetLobby = vi.fn();
const mockQueueSetYanivState = vi.fn();
const mockRunTransaction = vi.fn();
const mockPublishYanivState = vi.fn();
const mockCreateDeck = vi.fn();
const mockDrawCard = vi.fn();
const mockDrawCards = vi.fn();
const mockCreateDiscard = vi.fn();
const mockPushDiscard = vi.fn();

vi.mock('~/server/data/lobby', () => ({
  getLobby: mockGetLobby,
  queueSetLobby: mockQueueSetLobby,
}));
vi.mock('~/server/data/yaniv', () => ({
  queueSetYanivState: mockQueueSetYanivState,
}));
vi.mock('~/server/data/redis', () => ({ runTransaction: mockRunTransaction }));
vi.mock('~/server/events/yaniv', () => ({
  publishYanivState: mockPublishYanivState,
}));
vi.mock('~/server/data/deck', () => ({
  yanivDeck: {
    createDeck: mockCreateDeck,
    drawCard: mockDrawCard,
    drawCards: mockDrawCards,
  },
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

const makeLobby = (
  players = [HOST, PLAYER_2],
  settings: { handSize: HandSize } = { handSize: DEFAULT_HAND_SIZE },
) => ({
  code: CODE,
  type: GameType.YANIV,
  host: HOST,
  settings,
  players: players.map((id) => ({ id, name: `Player ${id}`, isReady: true })),
  isGameStarted: false,
});

const makeCard = (i: number) => ({ suit: 'hearts', rank: i + 2 });

describe('startGame', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetLobby.mockResolvedValue(makeLobby());
    mockRunTransaction.mockImplementation(
      async (queueWrites: (transaction: unknown) => void) =>
        queueWrites(TRANSACTION),
    );
    mockPublishYanivState.mockResolvedValue(undefined);
    mockCreateDeck.mockResolvedValue(undefined);
    mockCreateDiscard.mockResolvedValue(undefined);
    mockPushDiscard.mockResolvedValue(undefined);
    let callCount = 0;
    mockDrawCards.mockImplementation((_code: GameCode, count: number) =>
      Promise.resolve(
        Array.from({ length: count }, () => makeCard(callCount++)),
      ),
    );
    mockDrawCard.mockImplementation(() =>
      Promise.resolve(makeCard(callCount++)),
    );
  });

  test('throws when lobby not found', async () => {
    mockGetLobby.mockResolvedValue(null);
    await expect(startGame(CODE, HOST)).rejects.toThrow('Lobby not found');
  });

  test('does not deal again when the game has already started', async () => {
    mockGetLobby.mockResolvedValue({ ...makeLobby(), isGameStarted: true });

    await expect(startGame(CODE, HOST)).rejects.toThrow(
      'Game has already started',
    );
    expect(mockCreateDeck).not.toHaveBeenCalled();
    expect(mockRunTransaction).not.toHaveBeenCalled();
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

  test('throws when more than the maximum number of players', async () => {
    const tooManyPlayers = [
      HOST,
      ...Array.from(
        { length: MAX_PLAYERS },
        (_, i) => `user-${i + 2}` as UserId,
      ),
    ];
    mockGetLobby.mockResolvedValue(makeLobby(tooManyPlayers));
    await expect(startGame(CODE, HOST)).rejects.toThrow(
      'Too many players to start the game',
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

  test('deals a full hand to each player', async () => {
    await startGame(CODE, HOST);
    expect(mockQueueSetYanivState).toHaveBeenCalledOnce();
    const state = mockQueueSetYanivState.mock.calls[0]?.[2] as {
      players: Array<{ id: string; hand: unknown[] }>;
    };
    for (const player of state.players) {
      expect(player.hand).toHaveLength(DEFAULT_HAND_SIZE);
    }
  });

  test('sets card count to the hand size for each player', async () => {
    await startGame(CODE, HOST);
    const state = mockQueueSetYanivState.mock.calls[0]?.[2] as {
      players: Array<{ cardCount: number }>;
    };
    for (const player of state.players) {
      expect(player.cardCount).toBe(DEFAULT_HAND_SIZE);
    }
  });

  test('deals the hand size the host chose', async () => {
    mockGetLobby.mockResolvedValue(
      makeLobby([HOST, PLAYER_2], { handSize: 7 }),
    );

    await startGame(CODE, HOST);

    expect(mockDrawCards).toHaveBeenCalledWith(CODE, 7);
    const state = mockQueueSetYanivState.mock.calls[0]?.[2] as {
      handSize: number;
    };
    expect(state.handSize).toBe(7);
  });

  test('seeds the discard pile with one card', async () => {
    await startGame(CODE, HOST);
    expect(mockCreateDiscard).toHaveBeenCalledOnce();
    expect(mockPushDiscard).toHaveBeenCalledOnce();
    expect(mockPushDiscard).toHaveBeenCalledWith(CODE, expect.anything());
  });

  test('draws one hand per player via drawCards and one card for the discard', async () => {
    await startGame(CODE, HOST);
    expect(mockDrawCards).toHaveBeenCalledTimes(2);
    expect(mockDrawCards).toHaveBeenCalledWith(CODE, DEFAULT_HAND_SIZE);
    expect(mockDrawCard).toHaveBeenCalledOnce();
  });

  test('persists state as IN_PROGRESS with PLAY_CARDS step', async () => {
    await startGame(CODE, HOST);
    expect(mockQueueSetYanivState).toHaveBeenCalledOnce();
    expect(mockQueueSetYanivState).toHaveBeenCalledWith(
      TRANSACTION,
      { code: CODE },
      expect.objectContaining({
        gameStage: GameStage.IN_PROGRESS,
        gameStep: GameStep.PLAY_CARDS,
        currentPlayerId: HOST,
        playedCards: [],
      }),
    );
  });

  test('marks the lobby as started', async () => {
    await startGame(CODE, HOST);
    expect(mockQueueSetLobby).toHaveBeenCalledOnce();
    expect(mockQueueSetLobby).toHaveBeenCalledWith(
      TRANSACTION,
      { code: CODE },
      expect.objectContaining({ isGameStarted: true }),
    );
  });

  test('saves the started lobby and game state in one transaction', async () => {
    await startGame(CODE, HOST);
    expect(mockRunTransaction).toHaveBeenCalledOnce();
    expect(mockQueueSetLobby).toHaveBeenCalledWith(
      TRANSACTION,
      expect.anything(),
      expect.anything(),
    );
    expect(mockQueueSetYanivState).toHaveBeenCalledWith(
      TRANSACTION,
      expect.anything(),
      expect.anything(),
    );
  });

  test('does not publish the state when saving fails', async () => {
    mockRunTransaction.mockRejectedValue(new Error('Transaction failed'));

    await expect(startGame(CODE, HOST)).rejects.toThrow('Transaction failed');
    expect(mockPublishYanivState).not.toHaveBeenCalled();
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
