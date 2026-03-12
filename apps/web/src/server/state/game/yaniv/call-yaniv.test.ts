import { beforeEach, describe, expect, test, vi } from 'vitest';
import { yanivDiscard } from '~/server/data/discard';
import { getYanivState, setYanivState } from '~/server/data/yaniv';
import { publishYanivState } from '~/server/events/yaniv';
import { Rank, Suit } from '~/types/cards';
import type { PlayerName, UserId } from '~/types/entities';
import type { GameCode } from '~/types/game';
import {
  GameStage,
  type GameState,
  GameStep,
  type YanivPlayingCard,
} from '~/types/games/yaniv';

type State = Extract<GameState, { gameStage: GameStage.IN_PROGRESS }>;

vi.mock('~/server/data/yaniv', () => ({
  getYanivState: vi.fn(),
  setYanivState: vi.fn(),
}));
vi.mock('~/server/events/yaniv', () => ({
  publishYanivState: vi.fn(),
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

// USER_1 hand sums to 5 (ACE=1, FOUR=4), USER_2 hand sums to 10 (FOUR=4, SIX=6)
const makeState = (overrides: Partial<State> = {}): State => ({
  gameStage: GameStage.IN_PROGRESS,
  gameStep: GameStep.PROCEED,
  currentPlayerId: USER_1,
  players: [
    {
      id: USER_1,
      cardCount: 2,
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
      { suit: Suit.HEARTS, rank: Rank.ACE },
      { suit: Suit.SPADES, rank: Rank.FOUR },
    ],
    [USER_2]: [
      { suit: Suit.DIAMONDS, rank: Rank.FOUR },
      { suit: Suit.CLUBS, rank: Rank.SIX },
    ],
  },
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
        hands: {
          [USER_1]: [
            { suit: Suit.HEARTS, rank: Rank.FIVE },
            { suit: Suit.SPADES, rank: Rank.FIVE },
          ] as YanivPlayingCard[],
          [USER_2]: [
            { suit: Suit.DIAMONDS, rank: Rank.FOUR },
            { suit: Suit.CLUBS, rank: Rank.SIX },
          ] as YanivPlayingCard[],
        },
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

    const savedState = vi.mocked(setYanivState).mock.calls[0]?.[1];
    const players = (savedState as State).players;
    expect(players.find((p) => p.id === USER_1)?.isYanivCalled).toBe(true);
    expect(players.find((p) => p.id === USER_2)?.isYanivCalled).toBe(false);
  });

  test('caller score stays the same on clean Yaniv, others add hand value', async () => {
    await callYaniv(CODE, USER_1);

    const savedState = vi.mocked(setYanivState).mock.calls[0]?.[1];
    const players = (savedState as State).players;
    expect(players.find((p) => p.id === USER_1)?.score).toBe(0);
    expect(players.find((p) => p.id === USER_2)?.score).toBe(10);
  });

  test('caller gets +25 penalty when beaten by an opponent with equal or lower hand value', async () => {
    // USER_2 hand sums to 5 (≤ USER_1 hand of 5) → beaten
    vi.mocked(getYanivState).mockResolvedValue(
      makeState({
        hands: {
          [USER_1]: [
            { suit: Suit.HEARTS, rank: Rank.ACE },
            { suit: Suit.SPADES, rank: Rank.FOUR },
          ] as YanivPlayingCard[],
          [USER_2]: [
            { suit: Suit.DIAMONDS, rank: Rank.TWO },
            { suit: Suit.CLUBS, rank: Rank.THREE },
          ] as YanivPlayingCard[],
        },
      }),
    );

    await callYaniv(CODE, USER_1);

    const savedState = vi.mocked(setYanivState).mock.calls[0]?.[1];
    const players = (savedState as State).players;
    expect(players.find((p) => p.id === USER_1)?.score).toBe(25);
  });

  test('caller penalty is applied once even when multiple opponents beat the call', async () => {
    const USER_3 = 'user-3' as UserId;
    vi.mocked(getYanivState).mockResolvedValue(
      makeState({
        players: [
          {
            id: USER_1,
            cardCount: 2,
            name: 'Player 1' as PlayerName,
            score: 0,
            isFiftyScoreHalved: false,
            isHundredScoreHalved: false,
            isYanivCalled: false,
          },
          {
            id: USER_2,
            cardCount: 1,
            name: 'Player 2' as PlayerName,
            score: 0,
            isFiftyScoreHalved: false,
            isHundredScoreHalved: false,
            isYanivCalled: false,
          },
          {
            id: USER_3,
            cardCount: 1,
            name: 'Player 3' as PlayerName,
            score: 0,
            isFiftyScoreHalved: false,
            isHundredScoreHalved: false,
            isYanivCalled: false,
          },
        ],
        hands: {
          [USER_1]: [
            { suit: Suit.HEARTS, rank: Rank.ACE },
            { suit: Suit.SPADES, rank: Rank.FOUR },
          ] as YanivPlayingCard[],
          [USER_2]: [
            { suit: Suit.DIAMONDS, rank: Rank.THREE },
          ] as YanivPlayingCard[],
          [USER_3]: [
            { suit: Suit.CLUBS, rank: Rank.TWO },
          ] as YanivPlayingCard[],
        },
      }),
    );

    await callYaniv(CODE, USER_1);

    const savedState = vi.mocked(setYanivState).mock.calls[0]?.[1];
    const players = (savedState as State).players;
    expect(players.find((p) => p.id === USER_1)?.score).toBe(25);
  });

  describe('score halving', () => {
    test('halves score from 50 to 25 and sets the halved flag', async () => {
      vi.mocked(getYanivState).mockResolvedValue(
        makeState({
          players: [
            {
              id: USER_1,
              cardCount: 2,
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
              score: 44,
              isFiftyScoreHalved: false,
              isHundredScoreHalved: false,
              isYanivCalled: false,
            },
          ],
          hands: {
            [USER_1]: [
              { suit: Suit.HEARTS, rank: Rank.ACE },
              { suit: Suit.SPADES, rank: Rank.FOUR },
            ] as YanivPlayingCard[],
            [USER_2]: [
              { suit: Suit.DIAMONDS, rank: Rank.TWO },
              { suit: Suit.CLUBS, rank: Rank.FOUR },
            ] as YanivPlayingCard[],
          },
        }),
      );

      await callYaniv(CODE, USER_1);

      const savedState = vi.mocked(setYanivState).mock.calls[0]?.[1];
      const players = (savedState as State).players;
      const user2 = players.find((p) => p.id === USER_2);
      expect(user2?.score).toBe(25);
      expect(user2?.isFiftyScoreHalved).toBe(true);
    });

    test('halves score from 100 to 50 and sets the halved flag', async () => {
      vi.mocked(getYanivState).mockResolvedValue(
        makeState({
          players: [
            {
              id: USER_1,
              cardCount: 2,
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
              score: 90,
              isFiftyScoreHalved: true,
              isHundredScoreHalved: false,
              isYanivCalled: false,
            },
          ],
        }),
      );

      await callYaniv(CODE, USER_1);

      const savedState = vi.mocked(setYanivState).mock.calls[0]?.[1];
      const players = (savedState as State).players;
      const user2 = players.find((p) => p.id === USER_2);
      expect(user2?.score).toBe(50);
      expect(user2?.isHundredScoreHalved).toBe(true);
    });

    test('does not re-halve score of exactly 50 when already halved', async () => {
      vi.mocked(getYanivState).mockResolvedValue(
        makeState({
          players: [
            {
              id: USER_1,
              cardCount: 2,
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
              score: 44,
              isFiftyScoreHalved: true,
              isHundredScoreHalved: false,
              isYanivCalled: false,
            },
          ],
        }),
      );

      await callYaniv(CODE, USER_1);

      const savedState = vi.mocked(setYanivState).mock.calls[0]?.[1];
      const players = (savedState as State).players;
      const user2 = players.find((p) => p.id === USER_2);
      expect(user2?.score).toBe(54);
    });

    test('does not halve score when total passes over 50 without landing on it', async () => {
      vi.mocked(getYanivState).mockResolvedValue(
        makeState({
          players: [
            {
              id: USER_1,
              cardCount: 2,
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
              score: 45,
              isFiftyScoreHalved: false,
              isHundredScoreHalved: false,
              isYanivCalled: false,
            },
          ],
          hands: {
            [USER_1]: [
              { suit: Suit.HEARTS, rank: Rank.ACE },
              { suit: Suit.SPADES, rank: Rank.FOUR },
            ] as YanivPlayingCard[],
            [USER_2]: [
              { suit: Suit.DIAMONDS, rank: Rank.FOUR },
              { suit: Suit.CLUBS, rank: Rank.FOUR },
            ] as YanivPlayingCard[],
          },
        }),
      );

      await callYaniv(CODE, USER_1);

      const savedState = vi.mocked(setYanivState).mock.calls[0]?.[1];
      const players = (savedState as State).players;
      const user2 = players.find((p) => p.id === USER_2);
      expect(user2?.score).toBe(53);
      expect(user2?.isFiftyScoreHalved).toBe(false);
    });
  });

  describe('game continues', () => {
    test('sets game step to REDEAL', async () => {
      await callYaniv(CODE, USER_1);

      expect(vi.mocked(setYanivState).mock.calls[0]?.[1]).toMatchObject({
        gameStep: GameStep.REDEAL,
      });
    });

    test('keeps current player as the Yaniv caller', async () => {
      await callYaniv(CODE, USER_1);

      expect(vi.mocked(setYanivState).mock.calls[0]?.[1]).toMatchObject({
        currentPlayerId: USER_1,
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
  });

  describe('game over', () => {
    test('transitions to FINISHED stage when any player exceeds 200 points', async () => {
      vi.mocked(getYanivState).mockResolvedValue(
        makeState({
          players: [
            {
              id: USER_1,
              cardCount: 2,
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
              score: 195,
              isFiftyScoreHalved: false,
              isHundredScoreHalved: false,
              isYanivCalled: false,
            },
          ],
        }),
      );

      await callYaniv(CODE, USER_1);

      expect(vi.mocked(setYanivState).mock.calls[0]?.[1]).toMatchObject({
        gameStage: GameStage.FINISHED,
      });
    });

    test('sets winners to players with lowest score', async () => {
      vi.mocked(getYanivState).mockResolvedValue(
        makeState({
          players: [
            {
              id: USER_1,
              cardCount: 2,
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
              score: 195,
              isFiftyScoreHalved: false,
              isHundredScoreHalved: false,
              isYanivCalled: false,
            },
          ],
        }),
      );

      await callYaniv(CODE, USER_1);

      const savedState = vi.mocked(setYanivState).mock.calls[0]?.[1] as Extract<
        GameState,
        { gameStage: GameStage.FINISHED }
      >;
      expect(savedState.winners).toEqual([USER_1]);
    });

    test('includes multiple winners when scores are tied for the lowest', async () => {
      const USER_3 = 'user-3' as UserId;
      // USER_1 calls Yaniv (hand=5), USER_3 hand=5 (≤ caller), so USER_1 is beaten (+25 → score 25).
      // USER_3 starts at score 20, adds hand value 5 → score 25. Both tie.
      // USER_2 starts at 195 + hand 10 = 205 (>200 → game over).
      vi.mocked(getYanivState).mockResolvedValue(
        makeState({
          players: [
            {
              id: USER_1,
              cardCount: 2,
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
              score: 195,
              isFiftyScoreHalved: false,
              isHundredScoreHalved: false,
              isYanivCalled: false,
            },
            {
              id: USER_3,
              cardCount: 2,
              name: 'Player 3' as PlayerName,
              score: 20,
              isFiftyScoreHalved: false,
              isHundredScoreHalved: false,
              isYanivCalled: false,
            },
          ],
          hands: {
            [USER_1]: [
              { suit: Suit.HEARTS, rank: Rank.ACE },
              { suit: Suit.SPADES, rank: Rank.FOUR },
            ] as YanivPlayingCard[],
            [USER_2]: [
              { suit: Suit.DIAMONDS, rank: Rank.FOUR },
              { suit: Suit.CLUBS, rank: Rank.SIX },
            ] as YanivPlayingCard[],
            [USER_3]: [
              { suit: Suit.HEARTS, rank: Rank.TWO },
              { suit: Suit.SPADES, rank: Rank.THREE },
            ] as YanivPlayingCard[],
          },
        }),
      );

      await callYaniv(CODE, USER_1);

      const savedState = vi.mocked(setYanivState).mock.calls[0]?.[1] as Extract<
        GameState,
        { gameStage: GameStage.FINISHED }
      >;
      expect(savedState.winners).toContain(USER_1);
      expect(savedState.winners).toContain(USER_3);
      expect(savedState.winners).not.toContain(USER_2);
    });

    test('includes hands in finished state', async () => {
      const state = makeState({
        players: [
          {
            id: USER_1,
            cardCount: 2,
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
            score: 195,
            isFiftyScoreHalved: false,
            isHundredScoreHalved: false,
            isYanivCalled: false,
          },
        ],
      });
      vi.mocked(getYanivState).mockResolvedValue(state);

      await callYaniv(CODE, USER_1);

      const savedState = vi.mocked(setYanivState).mock.calls[0]?.[1] as Extract<
        GameState,
        { gameStage: GameStage.FINISHED }
      >;
      expect(savedState.hands).toEqual(state.hands);
    });
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
});
