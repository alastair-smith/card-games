import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { z } from 'zod';
import { getYanivState, setYanivState } from '~/server/data/yaniv';
import { publishYanivState } from '~/server/events/yaniv';
import { Rank, Suit } from '~/types/cards';
import type { PlayerName, UserId } from '~/types/entities';
import type { GameCode } from '~/types/game';
import {
  GameStage,
  GameStep,
  type gameStateSchema,
  type YanivPlayingCard,
} from '~/types/games/yaniv';

type State = Extract<
  z.infer<typeof gameStateSchema>,
  { gameStage: GameStage.IN_PROGRESS }
>;

vi.mock('~/server/data/yaniv', () => ({
  getYanivState: vi.fn(),
  setYanivState: vi.fn(),
}));
vi.mock('~/server/events/yaniv', () => ({
  publishYanivState: vi.fn(),
}));

const { endTurn } = await import('./end-turn');

const CODE = 'ABCDEF' as GameCode;
const USER_1 = 'user-1' as UserId;
const USER_2 = 'user-2' as UserId;

const DRAWN_CARD: YanivPlayingCard = { suit: Suit.CLUBS, rank: Rank.THREE };

const makeState = (overrides: Partial<State> = {}): State => ({
  gameStage: GameStage.IN_PROGRESS,
  gameStep: GameStep.PROCEED,
  currentPlayerId: USER_1,
  players: [
    {
      id: USER_1,
      cardCount: 3,
      name: 'Player 1' as PlayerName,
      score: 0,
      isFiftyScoreHalved: false,
      isHundredScoreHalved: false,
      isYanivCalled: false,
    },
    {
      id: USER_2,
      cardCount: 2,
      name: 'Player 2' as PlayerName,
      score: 0,
      isFiftyScoreHalved: false,
      isHundredScoreHalved: false,
      isYanivCalled: false,
    },
  ],
  hands: {
    [USER_1]: [
      { suit: Suit.HEARTS, rank: Rank.FIVE },
      { suit: Suit.SPADES, rank: Rank.SEVEN },
      DRAWN_CARD,
    ],
    [USER_2]: [
      { suit: Suit.DIAMONDS, rank: Rank.FOUR },
      { suit: Suit.CLUBS, rank: Rank.SIX },
    ],
  },
  playedCards: [{ suit: Suit.HEARTS, rank: Rank.TWO }],
  drawnCard: DRAWN_CARD,
  ...overrides,
});

describe('endTurn', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getYanivState).mockResolvedValue(makeState());
    vi.mocked(setYanivState).mockResolvedValue(makeState());
    vi.mocked(publishYanivState).mockResolvedValue(undefined);
  });

  test('throws when game not found', async () => {
    vi.mocked(getYanivState).mockResolvedValue(null);

    await expect(endTurn(CODE, USER_1)).rejects.toThrow('Game not found');
  });

  test('throws when game is not in progress', async () => {
    vi.mocked(getYanivState).mockResolvedValue({ gameStage: GameStage.LOBBY });

    await expect(endTurn(CODE, USER_1)).rejects.toThrow(
      'Game is not in progress',
    );
  });

  test('throws when not the proceed step', async () => {
    vi.mocked(getYanivState).mockResolvedValue(
      makeState({ gameStep: GameStep.PLAY_CARDS }),
    );

    await expect(endTurn(CODE, USER_1)).rejects.toThrow('Not the proceed step');
  });

  test('throws when not the current player', async () => {
    await expect(endTurn(CODE, USER_2)).rejects.toThrow('Not your turn');
  });

  test('clears played cards', async () => {
    await endTurn(CODE, USER_1);

    expect(vi.mocked(setYanivState).mock.calls[0]?.[1]).toMatchObject({
      playedCards: [],
    });
  });

  test('clears drawn card', async () => {
    await endTurn(CODE, USER_1);

    expect(vi.mocked(setYanivState).mock.calls[0]?.[1]).toHaveProperty(
      'drawnCard',
      undefined,
    );
  });

  test('advances to the next player', async () => {
    await endTurn(CODE, USER_1);

    expect(vi.mocked(setYanivState).mock.calls[0]?.[1]).toMatchObject({
      currentPlayerId: USER_2,
    });
  });

  test('wraps around to the first player after the last player', async () => {
    vi.mocked(getYanivState).mockResolvedValue(
      makeState({ currentPlayerId: USER_2 }),
    );

    await endTurn(CODE, USER_2);

    expect(vi.mocked(setYanivState).mock.calls[0]?.[1]).toMatchObject({
      currentPlayerId: USER_1,
    });
  });

  test('sets game step to PLAY_CARDS', async () => {
    await endTurn(CODE, USER_1);

    expect(vi.mocked(setYanivState).mock.calls[0]?.[1]).toMatchObject({
      gameStep: GameStep.PLAY_CARDS,
    });
  });

  test('persists and publishes the updated state', async () => {
    await endTurn(CODE, USER_1);

    expect(vi.mocked(setYanivState)).toHaveBeenCalledOnce();
    expect(vi.mocked(setYanivState)).toHaveBeenCalledWith(
      { code: CODE },
      expect.objectContaining({ gameStage: GameStage.IN_PROGRESS }),
    );
    expect(vi.mocked(publishYanivState)).toHaveBeenCalledOnce();
    expect(vi.mocked(publishYanivState)).toHaveBeenCalledWith(
      CODE,
      expect.objectContaining({ gameStage: GameStage.IN_PROGRESS }),
    );
  });
});
