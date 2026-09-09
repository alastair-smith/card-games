import { beforeEach, describe, expect, test, vi } from 'vitest';
import { yanivDiscard } from '~/server/data/discard';
import { getYanivState, setYanivState } from '~/server/data/yaniv';
import { publishEmoji } from '~/server/events/emoji';
import { publishYanivState } from '~/server/events/yaniv';
import { Rank, Suit } from '~/types/cards';
import type { PlayerName, UserId } from '~/types/entities';
import type { GameCode } from '~/types/game';
import {
  DEFAULT_HAND_SIZE,
  GameStage,
  type GameState,
  GameStep,
} from '~/types/games/yaniv';

type State = Extract<GameState, { gameStage: GameStage.IN_PROGRESS }>;

vi.mock('~/server/data/yaniv', () => ({
  getYanivState: vi.fn(),
  setYanivState: vi.fn(),
}));
vi.mock('~/server/events/yaniv', () => ({
  publishYanivState: vi.fn(),
}));
vi.mock('~/server/events/emoji', () => ({
  publishEmoji: vi.fn(),
}));
vi.mock('~/server/data/discard', () => ({
  yanivDiscard: {
    pushDiscard: vi.fn(),
  },
}));

const { callYaniv } = await import('./call-yaniv');

const CODE = 'ABCDEF' as GameCode;
const USER_1 = 'user-1' as UserId;
const USER_2 = 'user-2' as UserId;
const USER_3 = 'user-3' as UserId;

// USER_1 hand sums to 5 (ACE=1, FOUR=4), USER_2 hand sums to 10 (FOUR=4, SIX=6)
const makeState = (overrides: Partial<State> = {}): State => ({
  gameStage: GameStage.IN_PROGRESS,
  gameStep: GameStep.PROCEED,
  handSize: DEFAULT_HAND_SIZE,
  currentPlayerId: USER_1,
  players: [
    {
      id: USER_1,
      color: 'cyan',
      cardCount: 2,
      hand: [
        { suit: Suit.HEARTS, rank: Rank.ACE },
        { suit: Suit.SPADES, rank: Rank.FOUR },
      ],
      name: 'Player 1' as PlayerName,
      score: 0,
      isFiftyScoreHalved: false,
      isHundredScoreHalved: false,
      isYanivCalled: false,
      roundScore: { original: 0, adjusted: 0 },
    },
    {
      id: USER_2,
      color: 'cyan',
      cardCount: 2,
      hand: [
        { suit: Suit.DIAMONDS, rank: Rank.FOUR },
        { suit: Suit.CLUBS, rank: Rank.SIX },
      ],
      name: 'Player 2' as PlayerName,
      score: 0,
      isFiftyScoreHalved: false,
      isHundredScoreHalved: false,
      isYanivCalled: false,
      roundScore: { original: 0, adjusted: 0 },
    },
  ],
  playedCards: [{ suit: Suit.HEARTS, rank: Rank.TWO }],
  drawnCard: undefined,
  ...overrides,
});

describe('callYaniv', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getYanivState).mockResolvedValue(makeState());
    vi.mocked(setYanivState).mockResolvedValue(makeState());
    vi.mocked(publishYanivState).mockResolvedValue(undefined);
    vi.mocked(publishEmoji).mockReturnValue(undefined);
    vi.mocked(yanivDiscard.pushDiscard).mockResolvedValue(undefined);
  });

  test('throws when game not found', async () => {
    vi.mocked(getYanivState).mockResolvedValue(null);

    await expect(callYaniv(CODE, USER_1)).rejects.toThrow('Game not found');
  });

  test('throws when game is not in progress', async () => {
    vi.mocked(getYanivState).mockResolvedValue({ gameStage: GameStage.LOBBY });

    await expect(callYaniv(CODE, USER_1)).rejects.toThrow(
      'Game is not in progress',
    );
  });

  test('throws when not the proceed step', async () => {
    vi.mocked(getYanivState).mockResolvedValue(
      makeState({ gameStep: GameStep.PLAY_CARDS }),
    );

    await expect(callYaniv(CODE, USER_1)).rejects.toThrow(
      'Not the proceed step',
    );
  });

  test('throws when not the current player', async () => {
    await expect(callYaniv(CODE, USER_2)).rejects.toThrow('Not your turn');
  });

  test('throws when hand value is too high to call Yaniv', async () => {
    vi.mocked(getYanivState).mockResolvedValue(
      makeState({
        players: [
          {
            id: USER_1,
            color: 'cyan',
            cardCount: 2,
            hand: [
              { suit: Suit.HEARTS, rank: Rank.FIVE },
              { suit: Suit.SPADES, rank: Rank.FIVE },
            ],
            name: 'Player 1' as PlayerName,
            score: 0,
            isFiftyScoreHalved: false,
            isHundredScoreHalved: false,
            isYanivCalled: false,
            roundScore: { original: 0, adjusted: 0 },
          },
          {
            id: USER_2,
            color: 'cyan',
            cardCount: 2,
            hand: [
              { suit: Suit.DIAMONDS, rank: Rank.FOUR },
              { suit: Suit.CLUBS, rank: Rank.SIX },
            ],
            name: 'Player 2' as PlayerName,
            score: 0,
            isFiftyScoreHalved: false,
            isHundredScoreHalved: false,
            isYanivCalled: false,
            roundScore: { original: 0, adjusted: 0 },
          },
        ],
      }),
    );

    await expect(callYaniv(CODE, USER_1)).rejects.toThrow(
      'Hand value is too high to call Yaniv',
    );
  });

  test('pushes played cards to the discard pile', async () => {
    const state = makeState();
    await callYaniv(CODE, USER_1);

    expect(vi.mocked(yanivDiscard.pushDiscard)).toHaveBeenCalledOnce();
    expect(vi.mocked(yanivDiscard.pushDiscard)).toHaveBeenCalledWith(
      CODE,
      state.playedCards,
    );
  });

  test('marks caller with isYanivCalled flag', async () => {
    await callYaniv(CODE, USER_1);

    const savedState = vi.mocked(setYanivState).mock.calls[0]?.[1] as State;
    expect(savedState.players.find((p) => p.id === USER_1)?.isYanivCalled).toBe(
      true,
    );
    expect(savedState.players.find((p) => p.id === USER_2)?.isYanivCalled).toBe(
      false,
    );
  });

  test('does not score players', async () => {
    await callYaniv(CODE, USER_1);

    const savedState = vi.mocked(setYanivState).mock.calls[0]?.[1] as State;
    expect(savedState.players.find((p) => p.id === USER_1)?.score).toBe(0);
    expect(savedState.players.find((p) => p.id === USER_2)?.score).toBe(0);
  });

  test('scores and ends the round when all players have taken their final turn', async () => {
    // USER_2 called Yaniv first (hand=4); USER_1 takes their final turn and also calls Yaniv (hand=3)
    // USER_1 has lower hand value → USER_1 gets +0, USER_2 gets +25
    vi.mocked(getYanivState).mockResolvedValue(
      makeState({
        players: [
          {
            id: USER_1,
            color: 'cyan',
            cardCount: 2,
            hand: [
              { suit: Suit.HEARTS, rank: Rank.ACE },
              { suit: Suit.SPADES, rank: Rank.TWO },
            ],
            name: 'Player 1' as PlayerName,
            score: 0,
            isFiftyScoreHalved: false,
            isHundredScoreHalved: false,
            isYanivCalled: false,
            roundScore: { original: 0, adjusted: 0 },
          },
          {
            id: USER_2,
            color: 'cyan',
            cardCount: 2,
            hand: [
              { suit: Suit.DIAMONDS, rank: Rank.ACE },
              { suit: Suit.CLUBS, rank: Rank.THREE },
            ],
            name: 'Player 2' as PlayerName,
            score: 10,
            isFiftyScoreHalved: false,
            isHundredScoreHalved: false,
            isYanivCalled: true,
            roundScore: { original: 0, adjusted: 0 },
          },
        ],
      }),
    );

    await callYaniv(CODE, USER_1);

    const savedState = vi.mocked(setYanivState).mock.calls[0]?.[1] as State;
    expect(savedState.gameStep).toBe(GameStep.REDEAL);
    expect(savedState.players.find((p) => p.id === USER_1)?.score).toBe(0);
    expect(savedState.players.find((p) => p.id === USER_2)?.score).toBe(35);
    expect(savedState.currentPlayerId).toBe(USER_1);
  });

  test('caller with higher hand value among those who called Yaniv gets +25 penalty', async () => {
    // USER_2 called Yaniv first (hand=4); USER_1 also calls Yaniv (hand=3)
    // USER_1 has lower hand value → USER_1 gets +0, USER_2 gets +25, final score 45
    vi.mocked(getYanivState).mockResolvedValue(
      makeState({
        players: [
          {
            id: USER_1,
            color: 'cyan',
            cardCount: 2,
            hand: [
              { suit: Suit.HEARTS, rank: Rank.ACE },
              { suit: Suit.SPADES, rank: Rank.TWO },
            ],
            name: 'Player 1' as PlayerName,
            score: 0,
            isFiftyScoreHalved: false,
            isHundredScoreHalved: false,
            isYanivCalled: false,
            roundScore: { original: 0, adjusted: 0 },
          },
          {
            id: USER_2,
            color: 'cyan',
            cardCount: 2,
            hand: [
              { suit: Suit.DIAMONDS, rank: Rank.ACE },
              { suit: Suit.CLUBS, rank: Rank.THREE },
            ],
            name: 'Player 2' as PlayerName,
            score: 20,
            isFiftyScoreHalved: false,
            isHundredScoreHalved: false,
            isYanivCalled: true,
            roundScore: { original: 0, adjusted: 0 },
          },
        ],
      }),
    );

    await callYaniv(CODE, USER_1);

    const savedState = vi.mocked(setYanivState).mock.calls[0]?.[1] as State;
    expect(savedState.players.find((p) => p.id === USER_1)?.score).toBe(0);
    expect(savedState.players.find((p) => p.id === USER_2)?.score).toBe(45);
    expect(savedState.currentPlayerId).toBe(USER_1);
  });

  test('preserves isYanivCalled flag of earlier callers when a second player calls Yaniv', async () => {
    // USER_1 already called Yaniv; USER_2 now calls Yaniv; USER_3 has not yet had their turn
    vi.mocked(getYanivState).mockResolvedValue(
      makeState({
        currentPlayerId: USER_2,
        players: [
          {
            id: USER_1,
            color: 'cyan',
            cardCount: 2,
            hand: [
              { suit: Suit.HEARTS, rank: Rank.ACE },
              { suit: Suit.SPADES, rank: Rank.FOUR },
            ],
            name: 'Player 1' as PlayerName,
            score: 0,
            isFiftyScoreHalved: false,
            isHundredScoreHalved: false,
            isYanivCalled: true,
            roundScore: { original: 0, adjusted: 0 },
          },
          {
            id: USER_2,
            color: 'cyan',
            cardCount: 2,
            hand: [
              { suit: Suit.DIAMONDS, rank: Rank.TWO },
              { suit: Suit.CLUBS, rank: Rank.THREE },
            ],
            name: 'Player 2' as PlayerName,
            score: 0,
            isFiftyScoreHalved: false,
            isHundredScoreHalved: false,
            isYanivCalled: false,
            roundScore: { original: 0, adjusted: 0 },
          },
          {
            id: USER_3,
            color: 'cyan',
            cardCount: 2,
            hand: [
              { suit: Suit.SPADES, rank: Rank.TWO },
              { suit: Suit.HEARTS, rank: Rank.SIX },
            ],
            name: 'Player 3' as PlayerName,
            score: 0,
            isFiftyScoreHalved: false,
            isHundredScoreHalved: false,
            isYanivCalled: false,
            roundScore: { original: 0, adjusted: 0 },
          },
        ],
      }),
    );

    await callYaniv(CODE, USER_2);

    const savedState = vi.mocked(setYanivState).mock.calls[0]?.[1] as State;
    expect(savedState.players.find((p) => p.id === USER_1)?.isYanivCalled).toBe(
      true,
    );
    expect(savedState.players.find((p) => p.id === USER_2)?.isYanivCalled).toBe(
      true,
    );
    expect(savedState.players.find((p) => p.id === USER_3)?.isYanivCalled).toBe(
      false,
    );
  });

  test('advances to the next player', async () => {
    await callYaniv(CODE, USER_1);

    expect(vi.mocked(setYanivState).mock.calls[0]?.[1]).toMatchObject({
      currentPlayerId: USER_2,
    });
  });

  test('wraps around to the first player after the last player', async () => {
    vi.mocked(getYanivState).mockResolvedValue(
      makeState({
        currentPlayerId: USER_2,
        players: [
          {
            id: USER_1,
            color: 'cyan',
            cardCount: 2,
            hand: [
              { suit: Suit.HEARTS, rank: Rank.ACE },
              { suit: Suit.SPADES, rank: Rank.FOUR },
            ],
            name: 'Player 1' as PlayerName,
            score: 0,
            isFiftyScoreHalved: false,
            isHundredScoreHalved: false,
            isYanivCalled: false,
            roundScore: { original: 0, adjusted: 0 },
          },
          {
            id: USER_2,
            color: 'cyan',
            cardCount: 2,
            hand: [
              { suit: Suit.DIAMONDS, rank: Rank.ACE },
              { suit: Suit.CLUBS, rank: Rank.THREE },
            ],
            name: 'Player 2' as PlayerName,
            score: 0,
            isFiftyScoreHalved: false,
            isHundredScoreHalved: false,
            isYanivCalled: false,
            roundScore: { original: 0, adjusted: 0 },
          },
        ],
      }),
    );

    await callYaniv(CODE, USER_2);

    expect(vi.mocked(setYanivState).mock.calls[0]?.[1]).toMatchObject({
      currentPlayerId: USER_1,
    });
  });

  test('sets game step to PLAY_CARDS', async () => {
    await callYaniv(CODE, USER_1);

    expect(vi.mocked(setYanivState).mock.calls[0]?.[1]).toMatchObject({
      gameStep: GameStep.PLAY_CARDS,
    });
  });

  test('clears played cards', async () => {
    await callYaniv(CODE, USER_1);

    expect(vi.mocked(setYanivState).mock.calls[0]?.[1]).toMatchObject({
      playedCards: [],
    });
  });

  test('clears drawn card', async () => {
    await callYaniv(CODE, USER_1);

    expect(vi.mocked(setYanivState).mock.calls[0]?.[1]).toHaveProperty(
      'drawnCard',
      undefined,
    );
  });

  test('persists and publishes the updated state', async () => {
    await callYaniv(CODE, USER_1);

    expect(vi.mocked(setYanivState)).toHaveBeenCalledOnce();
    expect(vi.mocked(publishYanivState)).toHaveBeenCalledOnce();
    expect(vi.mocked(setYanivState).mock.calls[0]?.[0]).toEqual({ code: CODE });
    const savedState = vi.mocked(setYanivState).mock.calls[0]?.[1];
    const publishedState = vi.mocked(publishYanivState).mock.calls[0]?.[1];
    expect(savedState).toEqual(publishedState);
  });

  test('publishes a megaphone emoji reaction targeting the player who called Yaniv', async () => {
    await callYaniv(CODE, USER_1);

    expect(vi.mocked(publishEmoji)).toHaveBeenCalledOnce();
    expect(vi.mocked(publishEmoji)).toHaveBeenCalledWith(CODE, {
      emoji: '📢',
      targetPlayerId: USER_1,
      id: expect.any(String),
    });
  });
});
