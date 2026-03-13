import { beforeEach, describe, expect, test, vi } from 'vitest';
import { getYanivState } from '~/server/data/yaniv';
import { Rank, Suit } from '~/types/cards';
import type { PlayerName, UserId } from '~/types/entities';
import type { GameCode } from '~/types/game';
import {
  GameStage,
  type GameState,
  GameStep,
  type YanivPlayingCard,
} from '~/types/games/yaniv';

type InProgressState = Extract<GameState, { gameStage: GameStage.IN_PROGRESS }>;
type FinishedState = Extract<GameState, { gameStage: GameStage.FINISHED }>;

vi.mock('~/server/data/yaniv', () => ({
  getYanivState: vi.fn(),
}));

const { getGameState } = await import('./get-game-state');

const CODE = 'ABCDEF' as GameCode;
const USER_1 = 'user-1' as UserId;
const USER_2 = 'user-2' as UserId;

const USER_1_CARDS: YanivPlayingCard[] = [
  { suit: Suit.HEARTS, rank: Rank.TWO },
  { suit: Suit.SPADES, rank: Rank.THREE },
];
const USER_2_CARDS: YanivPlayingCard[] = [
  { suit: Suit.CLUBS, rank: Rank.FOUR },
  { suit: Suit.DIAMONDS, rank: Rank.FIVE },
];

const makePlayers = () => [
  {
    id: USER_1,
    cardCount: 2,
    name: 'Player 1' as PlayerName,
    score: 10,
    isFiftyScoreHalved: false,
    isHundredScoreHalved: false,
    isYanivCalled: false,
  },
  {
    id: USER_2,
    cardCount: 2,
    name: 'Player 2' as PlayerName,
    score: 20,
    isFiftyScoreHalved: false,
    isHundredScoreHalved: false,
    isYanivCalled: false,
  },
];

const makeInProgressState = (
  overrides: Partial<InProgressState> = {},
): InProgressState => ({
  gameStage: GameStage.IN_PROGRESS,
  gameStep: GameStep.PLAY_CARDS,
  currentPlayerId: USER_1,
  players: makePlayers(),
  playedCards: [],
  hands: {
    [USER_1]: USER_1_CARDS,
    [USER_2]: USER_2_CARDS,
  },
  ...overrides,
});

const makeFinishedState = (
  overrides: Partial<FinishedState> = {},
): FinishedState => ({
  gameStage: GameStage.FINISHED,
  players: makePlayers(),
  winners: [USER_1],
  hands: {
    [USER_1]: USER_1_CARDS,
    [USER_2]: USER_2_CARDS,
  },
  ...overrides,
});

describe('getGameState', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('returns null when game not found', async () => {
    vi.mocked(getYanivState).mockResolvedValue(null);

    const result = await getGameState(CODE, USER_1);

    expect(result).toBeNull();
  });

  test('returns lobby state with empty hand and players', async () => {
    vi.mocked(getYanivState).mockResolvedValue({ gameStage: GameStage.LOBBY });

    const result = await getGameState(CODE, USER_1);

    expect(result).toEqual({
      gameStage: GameStage.LOBBY,
      hand: [],
      players: [],
    });
  });

  describe('in progress game', () => {
    test('returns correct hand for requesting user', async () => {
      vi.mocked(getYanivState).mockResolvedValue(makeInProgressState());

      const result = await getGameState(CODE, USER_1);

      expect(result?.hand).toEqual(USER_1_CARDS);
    });

    test('throws when requesting user is not in the game', async () => {
      vi.mocked(getYanivState).mockResolvedValue(makeInProgressState());

      await expect(getGameState(CODE, 'other-user' as UserId)).rejects.toThrow(
        'Player not in game',
      );
    });

    test('decorates requesting user with isUser true', async () => {
      vi.mocked(getYanivState).mockResolvedValue(makeInProgressState());

      const result = await getGameState(CODE, USER_1);

      expect(result?.players).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: USER_1, isUser: true }),
        ]),
      );
    });

    test('decorates other players with isUser false', async () => {
      vi.mocked(getYanivState).mockResolvedValue(makeInProgressState());

      const result = await getGameState(CODE, USER_1);

      expect(result?.players).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: USER_2, isUser: false }),
        ]),
      );
    });

    test('does not include hands in the returned state', async () => {
      vi.mocked(getYanivState).mockResolvedValue(makeInProgressState());

      const result = await getGameState(CODE, USER_1);

      expect(result).not.toHaveProperty('hands');
    });
  });

  describe('finished game', () => {
    test('returns correct hand for requesting user', async () => {
      vi.mocked(getYanivState).mockResolvedValue(makeFinishedState());

      const result = await getGameState(CODE, USER_2);

      expect(result?.hand).toEqual(USER_2_CARDS);
    });

    test('throws when requesting user is not in the game', async () => {
      vi.mocked(getYanivState).mockResolvedValue(makeFinishedState());

      await expect(getGameState(CODE, 'other-user' as UserId)).rejects.toThrow(
        'Player not in game',
      );
    });

    test('decorates players with isUser correctly', async () => {
      vi.mocked(getYanivState).mockResolvedValue(makeFinishedState());

      const result = await getGameState(CODE, USER_1);

      expect(result?.players).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: USER_1, isUser: true }),
          expect.objectContaining({ id: USER_2, isUser: false }),
        ]),
      );
    });

    test('does not include hands in the returned state', async () => {
      vi.mocked(getYanivState).mockResolvedValue(makeFinishedState());

      const result = await getGameState(CODE, USER_1);

      expect(result).not.toHaveProperty('hands');
    });
  });
});
