import { beforeEach, describe, expect, test, vi } from 'vitest';
import { setYanivState } from '~/server/data/yaniv';
import { publishYanivState } from '~/server/events/yaniv';
import { buildInProgressState, buildPlayer } from '~/test-utils/yaniv';
import { Rank, Suit } from '~/types/cards';
import type { UserId } from '~/types/entities';
import type { GameCode } from '~/types/game';
import {
  type GameStage,
  type GameState,
  GameStep,
  YANIV_CALLER_PENALTY,
} from '~/types/games/yaniv';

type State = Extract<GameState, { gameStage: GameStage.IN_PROGRESS }>;

vi.mock('~/server/data/yaniv', () => ({
  setYanivState: vi.fn(),
}));
vi.mock('~/server/events/yaniv', () => ({
  publishYanivState: vi.fn(),
}));

const { scoreYanivRound } = await import('./score-yaniv-round');

const CODE = 'ABCDEF' as GameCode;
const USER_1 = 'user-1' as UserId;
const USER_2 = 'user-2' as UserId;
const USER_3 = 'user-3' as UserId;

const makeState = (overrides: Partial<State> = {}): State =>
  buildInProgressState({
    gameStep: GameStep.PROCEED,
    currentPlayerId: USER_1,
    players: [
      buildPlayer({
        id: USER_1,
        hand: [
          { suit: Suit.HEARTS, rank: Rank.ACE },
          { suit: Suit.SPADES, rank: Rank.TWO },
        ],
        isYanivCalled: true,
      }),
      buildPlayer({
        id: USER_2,
        hand: [
          { suit: Suit.DIAMONDS, rank: Rank.FOUR },
          { suit: Suit.CLUBS, rank: Rank.SIX },
        ],
      }),
    ],
    drawnCard: undefined,
    ...overrides,
  });

describe('scoreYanivRound', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(setYanivState).mockResolvedValue(makeState());
    vi.mocked(publishYanivState).mockResolvedValue(undefined);
  });

  test('caller with lower hand value gets zero and other caller gets penalty', async () => {
    // Both players call Yaniv with same cumulative score
    // USER_1 hand=3 (ACE+TWO), USER_2 hand=7 (THREE+FOUR)
    // USER_1 should get +0, USER_2 should get +25
    const state = makeState({
      players: [
        buildPlayer({
          id: USER_1,
          hand: [
            { suit: Suit.HEARTS, rank: Rank.ACE },
            { suit: Suit.SPADES, rank: Rank.TWO },
          ],
          isYanivCalled: true,
        }),
        buildPlayer({
          id: USER_2,
          hand: [
            { suit: Suit.DIAMONDS, rank: Rank.THREE },
            { suit: Suit.CLUBS, rank: Rank.FOUR },
          ],
          isYanivCalled: true,
        }),
      ],
    });

    await scoreYanivRound(CODE, state);

    const savedState = vi.mocked(setYanivState).mock.calls[0]?.[1] as State;
    const player1 = savedState.players.find((p) => p.id === USER_1);
    const player2 = savedState.players.find((p) => p.id === USER_2);
    expect(player1?.score).toBe(0);
    expect(player1?.roundScore).toEqual({ original: 3, adjusted: 0 });
    expect(player2?.score).toBe(YANIV_CALLER_PENALTY);
    expect(player2?.roundScore).toEqual({
      original: 7,
      adjusted: YANIV_CALLER_PENALTY,
    });
  });

  test('callers with equal hand values both get zero', async () => {
    const state = makeState({
      players: [
        buildPlayer({
          id: USER_1,
          hand: [
            { suit: Suit.HEARTS, rank: Rank.ACE },
            { suit: Suit.SPADES, rank: Rank.TWO },
          ],
          isYanivCalled: true,
        }),
        buildPlayer({
          id: USER_2,
          hand: [
            { suit: Suit.DIAMONDS, rank: Rank.ACE },
            { suit: Suit.CLUBS, rank: Rank.TWO },
          ],
          isYanivCalled: true,
        }),
      ],
    });

    await scoreYanivRound(CODE, state);

    const savedState = vi.mocked(setYanivState).mock.calls[0]?.[1] as State;
    expect(savedState.players.find((p) => p.id === USER_1)?.score).toBe(0);
    expect(savedState.players.find((p) => p.id === USER_2)?.score).toBe(0);
  });

  test('non-caller gets their hand value added to their score', async () => {
    const state = makeState();

    await scoreYanivRound(CODE, state);

    const savedState = vi.mocked(setYanivState).mock.calls[0]?.[1] as State;
    const player2 = savedState.players.find((p) => p.id === USER_2);
    expect(player2?.score).toBe(10);
    expect(player2?.roundScore).toEqual({ original: 10, adjusted: 10 });
  });

  test('single caller always gets zero', async () => {
    const state = makeState();

    await scoreYanivRound(CODE, state);

    const savedState = vi.mocked(setYanivState).mock.calls[0]?.[1] as State;
    const player1 = savedState.players.find((p) => p.id === USER_1);
    expect(player1?.score).toBe(0);
    expect(player1?.roundScore).toEqual({ original: 3, adjusted: 0 });
  });

  test('among three callers, only the one with highest hand gets penalty', async () => {
    const state = makeState({
      players: [
        buildPlayer({
          id: USER_1,
          hand: [{ suit: Suit.HEARTS, rank: Rank.ACE }],
          score: 10,
          isYanivCalled: true,
        }),
        buildPlayer({
          id: USER_2,
          hand: [{ suit: Suit.DIAMONDS, rank: Rank.ACE }],
          score: 20,
          isYanivCalled: true,
        }),
        buildPlayer({
          id: USER_3,
          hand: [{ suit: Suit.CLUBS, rank: Rank.FIVE }],
          score: 30,
          isYanivCalled: true,
        }),
      ],
    });

    await scoreYanivRound(CODE, state);

    const savedState = vi.mocked(setYanivState).mock.calls[0]?.[1] as State;
    expect(savedState.players.find((p) => p.id === USER_1)?.score).toBe(10);
    expect(savedState.players.find((p) => p.id === USER_2)?.score).toBe(20);
    expect(savedState.players.find((p) => p.id === USER_3)?.score).toBe(55);
  });
});
