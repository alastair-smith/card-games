import { beforeEach, describe, expect, test, vi } from 'vitest';
import { getYanivState } from '~/server/data/yaniv';
import { buildInProgressState, buildPlayer } from '~/test-utils/yaniv';
import { Rank, Suit } from '~/types/cards';
import type { UserId } from '~/types/entities';
import type { GameCode } from '~/types/game';
import { GameStage, type GameState } from '~/types/games/yaniv';

type InProgressState = Extract<GameState, { gameStage: GameStage.IN_PROGRESS }>;
type FinishedState = Extract<GameState, { gameStage: GameStage.FINISHED }>;

vi.mock('~/server/data/yaniv', () => ({
  getYanivState: vi.fn(),
}));

const { getGameState } = await import('./get-game-state');

const CODE = 'ABCDEF' as GameCode;
const USER_1 = 'user-1' as UserId;
const USER_2 = 'user-2' as UserId;

const makePlayers = () => [
  buildPlayer({
    id: USER_1,
    hand: [
      { suit: Suit.HEARTS, rank: Rank.TWO },
      { suit: Suit.SPADES, rank: Rank.THREE },
    ],
    score: 10,
  }),
  buildPlayer({
    id: USER_2,
    hand: [
      { suit: Suit.CLUBS, rank: Rank.FOUR },
      { suit: Suit.DIAMONDS, rank: Rank.FIVE },
    ],
    score: 20,
  }),
];

const makeInProgressState = (
  overrides: Partial<InProgressState> = {},
): InProgressState =>
  buildInProgressState({
    currentPlayerId: USER_1,
    players: makePlayers(),
    ...overrides,
  });

const makeFinishedState = (
  overrides: Partial<FinishedState> = {},
): FinishedState => ({
  gameStage: GameStage.FINISHED,
  players: makePlayers(),
  winners: [USER_1],
  ...overrides,
});

describe('getGameState', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('returns null when game not found', async () => {
    vi.mocked(getYanivState).mockResolvedValue(null);

    const result = await getGameState(CODE);

    expect(result).toBeNull();
  });

  test('returns raw lobby state', async () => {
    vi.mocked(getYanivState).mockResolvedValue({ gameStage: GameStage.LOBBY });

    const result = await getGameState(CODE);

    expect(result).toEqual({ gameStage: GameStage.LOBBY });
  });

  test('returns raw in-progress state including all hands', async () => {
    const state = makeInProgressState();
    vi.mocked(getYanivState).mockResolvedValue(state);

    const result = await getGameState(CODE);

    expect(result).toEqual(state);
  });

  test('returns raw finished state including all hands', async () => {
    const state = makeFinishedState();
    vi.mocked(getYanivState).mockResolvedValue(state);

    const result = await getGameState(CODE);

    expect(result).toEqual(state);
  });
});
