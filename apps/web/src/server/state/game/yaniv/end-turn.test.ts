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

const { endTurn } = await import('./end-turn');

const CODE = 'ABCDEF' as GameCode;
const USER_1 = 'user-1' as UserId;
const USER_2 = 'user-2' as UserId;

const DRAWN_CARD: YanivPlayingCard = { suit: Suit.CLUBS, rank: Rank.THREE };

const USER_1_HAND: YanivPlayingCard[] = [
  { suit: Suit.HEARTS, rank: Rank.ACE },
  { suit: Suit.SPADES, rank: Rank.FOUR },
];
const USER_2_HAND: YanivPlayingCard[] = [
  { suit: Suit.DIAMONDS, rank: Rank.FOUR },
  { suit: Suit.CLUBS, rank: Rank.SIX },
];

// Normal state: no Yaniv called, USER_1 is current player
const makeState = (overrides: Partial<State> = {}): State => ({
  gameStage: GameStage.IN_PROGRESS,
  gameStep: GameStep.PROCEED,
  currentPlayerId: USER_1,
  players: [
    {
      id: USER_1,
      cardCount: 3,
      hand: [
        { suit: Suit.HEARTS, rank: Rank.FIVE },
        { suit: Suit.SPADES, rank: Rank.SEVEN },
        DRAWN_CARD,
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
  drawnCard: DRAWN_CARD,
  ...overrides,
});

// Post-Yaniv state: USER_1 called Yaniv (hand=5), USER_2 is taking their final turn
// When USER_2 calls endTurn, next is USER_1 (isYanivCalled) → round ends
const makeYanivCalledState = (overrides: Partial<State> = {}): State => ({
  gameStage: GameStage.IN_PROGRESS,
  gameStep: GameStep.PROCEED,
  currentPlayerId: USER_2,
  players: [
    {
      id: USER_1,
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
      roundScore: { original: 5, adjusted: 5 },
    },
    {
      id: USER_2,
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

describe('endTurn', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getYanivState).mockResolvedValue(makeState());
    vi.mocked(setYanivState).mockResolvedValue(makeState());
    vi.mocked(publishYanivState).mockResolvedValue(undefined);
    vi.mocked(yanivDiscard.pushDiscard).mockResolvedValue(undefined);
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

  test('throws when player has no cards in hand', async () => {
    vi.mocked(getYanivState).mockResolvedValue(
      makeState({
        players: [
          {
            id: USER_1,
            cardCount: 0,
            hand: [],
            name: 'Player 1' as PlayerName,
            score: 0,
            isFiftyScoreHalved: false,
            isHundredScoreHalved: false,
            isYanivCalled: false,
            roundScore: { original: 0, adjusted: 0 },
          },
          {
            id: USER_2,
            cardCount: 2,
            hand: USER_2_HAND,
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

    await expect(endTurn(CODE, USER_1)).rejects.toThrow(
      'You must call Yaniv when you have no cards',
    );
  });

  test('pushes played cards to the discard pile', async () => {
    const state = makeState();
    await endTurn(CODE, USER_1);

    expect(vi.mocked(yanivDiscard.pushDiscard)).toHaveBeenCalledOnce();
    expect(vi.mocked(yanivDiscard.pushDiscard)).toHaveBeenCalledWith(
      CODE,
      state.playedCards,
    );
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

  describe('when Yaniv was called and all players have had their final turn', () => {
    beforeEach(() => {
      vi.mocked(getYanivState).mockResolvedValue(makeYanivCalledState());
    });

    test('caller score stays the same on a clean Yaniv, others add their hand value', async () => {
      await endTurn(CODE, USER_2);

      const savedState = vi.mocked(setYanivState).mock.calls[0]?.[1] as State;
      expect(savedState.players.find((p) => p.id === USER_1)?.score).toBe(0);
      expect(savedState.players.find((p) => p.id === USER_2)?.score).toBe(10);
    });

    test('caller score stays at 0 when they are the only caller regardless of other hand values', async () => {
      vi.mocked(getYanivState).mockResolvedValue(
        makeYanivCalledState({
          players: [
            {
              id: USER_1,
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
          ],
        }),
      );

      await endTurn(CODE, USER_2);

      const savedState = vi.mocked(setYanivState).mock.calls[0]?.[1] as State;
      expect(savedState.players.find((p) => p.id === USER_1)?.score).toBe(0);
    });

    describe('score halving', () => {
      test('halves score from 50 to 25 and sets the halved flag', async () => {
        // USER_2 score 44 + hand 6 (TWO+FOUR) = 50 → halved to 25
        vi.mocked(getYanivState).mockResolvedValue(
          makeYanivCalledState({
            players: [
              {
                id: USER_1,
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
                cardCount: 2,
                hand: [
                  { suit: Suit.DIAMONDS, rank: Rank.TWO },
                  { suit: Suit.CLUBS, rank: Rank.FOUR },
                ],
                name: 'Player 2' as PlayerName,
                score: 44,
                isFiftyScoreHalved: false,
                isHundredScoreHalved: false,
                isYanivCalled: false,
                roundScore: { original: 0, adjusted: 0 },
              },
            ],
          }),
        );

        await endTurn(CODE, USER_2);

        const savedState = vi.mocked(setYanivState).mock.calls[0]?.[1] as State;
        const user2 = savedState.players.find((p) => p.id === USER_2);
        expect(user2?.score).toBe(25);
        expect(user2?.isFiftyScoreHalved).toBe(true);
      });

      test('halves score from 100 to 50 and sets the halved flag', async () => {
        // USER_2 score 90 + hand 10 = 100 → halved to 50
        vi.mocked(getYanivState).mockResolvedValue(
          makeYanivCalledState({
            players: [
              {
                id: USER_1,
                cardCount: 2,
                hand: USER_1_HAND,
                name: 'Player 1' as PlayerName,
                score: 0,
                isFiftyScoreHalved: false,
                isHundredScoreHalved: false,
                isYanivCalled: true,
                roundScore: { original: 0, adjusted: 0 },
              },
              {
                id: USER_2,
                cardCount: 2,
                hand: USER_2_HAND,
                name: 'Player 2' as PlayerName,
                score: 90,
                isFiftyScoreHalved: true,
                isHundredScoreHalved: false,
                isYanivCalled: false,
                roundScore: { original: 0, adjusted: 0 },
              },
            ],
          }),
        );

        await endTurn(CODE, USER_2);

        const savedState = vi.mocked(setYanivState).mock.calls[0]?.[1] as State;
        const user2 = savedState.players.find((p) => p.id === USER_2);
        expect(user2?.score).toBe(50);
        expect(user2?.isHundredScoreHalved).toBe(true);
      });

      test('does not re-halve score of exactly 50 when already halved', async () => {
        // USER_2 score 44 + hand 10 = 54, isFiftyScoreHalved already true → no halving
        vi.mocked(getYanivState).mockResolvedValue(
          makeYanivCalledState({
            players: [
              {
                id: USER_1,
                cardCount: 2,
                hand: USER_1_HAND,
                name: 'Player 1' as PlayerName,
                score: 0,
                isFiftyScoreHalved: false,
                isHundredScoreHalved: false,
                isYanivCalled: true,
                roundScore: { original: 0, adjusted: 0 },
              },
              {
                id: USER_2,
                cardCount: 2,
                hand: USER_2_HAND,
                name: 'Player 2' as PlayerName,
                score: 44,
                isFiftyScoreHalved: true,
                isHundredScoreHalved: false,
                isYanivCalled: false,
                roundScore: { original: 0, adjusted: 0 },
              },
            ],
          }),
        );

        await endTurn(CODE, USER_2);

        const savedState = vi.mocked(setYanivState).mock.calls[0]?.[1] as State;
        expect(savedState.players.find((p) => p.id === USER_2)?.score).toBe(54);
      });

      test('does not halve score when total passes over 50 without landing on it', async () => {
        // USER_2 score 45 + hand 8 (FOUR+FOUR) = 53 → no halving
        vi.mocked(getYanivState).mockResolvedValue(
          makeYanivCalledState({
            players: [
              {
                id: USER_1,
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
                cardCount: 2,
                hand: [
                  { suit: Suit.DIAMONDS, rank: Rank.FOUR },
                  { suit: Suit.CLUBS, rank: Rank.FOUR },
                ],
                name: 'Player 2' as PlayerName,
                score: 45,
                isFiftyScoreHalved: false,
                isHundredScoreHalved: false,
                isYanivCalled: false,
                roundScore: { original: 0, adjusted: 0 },
              },
            ],
          }),
        );

        await endTurn(CODE, USER_2);

        const savedState = vi.mocked(setYanivState).mock.calls[0]?.[1] as State;
        const user2 = savedState.players.find((p) => p.id === USER_2);
        expect(user2?.score).toBe(53);
        expect(user2?.isFiftyScoreHalved).toBe(false);
      });
    });

    describe('game continues', () => {
      test('sets game step to REDEAL', async () => {
        await endTurn(CODE, USER_2);

        expect(vi.mocked(setYanivState).mock.calls[0]?.[1]).toMatchObject({
          gameStep: GameStep.REDEAL,
        });
      });

      test('sets current player to the Yaniv caller with the lowest score', async () => {
        await endTurn(CODE, USER_2);

        expect(vi.mocked(setYanivState).mock.calls[0]?.[1]).toMatchObject({
          currentPlayerId: USER_1,
        });
      });

      test('clears played cards', async () => {
        await endTurn(CODE, USER_2);

        expect(vi.mocked(setYanivState).mock.calls[0]?.[1]).toMatchObject({
          playedCards: [],
        });
      });

      test('clears drawn card', async () => {
        await endTurn(CODE, USER_2);

        expect(vi.mocked(setYanivState).mock.calls[0]?.[1]).toHaveProperty(
          'drawnCard',
          undefined,
        );
      });
    });

    describe('game over', () => {
      test('transitions to FINISHED stage when any player exceeds 200 points', async () => {
        vi.mocked(getYanivState).mockResolvedValue(
          makeYanivCalledState({
            players: [
              {
                id: USER_1,
                cardCount: 2,
                hand: USER_1_HAND,
                name: 'Player 1' as PlayerName,
                score: 0,
                isFiftyScoreHalved: false,
                isHundredScoreHalved: false,
                isYanivCalled: true,
                roundScore: { original: 0, adjusted: 0 },
              },
              {
                id: USER_2,
                cardCount: 2,
                hand: USER_2_HAND,
                name: 'Player 2' as PlayerName,
                score: 195,
                isFiftyScoreHalved: false,
                isHundredScoreHalved: false,
                isYanivCalled: false,
                roundScore: { original: 0, adjusted: 0 },
              },
            ],
          }),
        );

        await endTurn(CODE, USER_2);

        expect(vi.mocked(setYanivState).mock.calls[0]?.[1]).toMatchObject({
          gameStage: GameStage.FINISHED,
        });
      });

      test('sets winners to the player with the lowest score', async () => {
        vi.mocked(getYanivState).mockResolvedValue(
          makeYanivCalledState({
            players: [
              {
                id: USER_1,
                cardCount: 2,
                hand: USER_1_HAND,
                name: 'Player 1' as PlayerName,
                score: 0,
                isFiftyScoreHalved: false,
                isHundredScoreHalved: false,
                isYanivCalled: true,
                roundScore: { original: 0, adjusted: 0 },
              },
              {
                id: USER_2,
                cardCount: 2,
                hand: USER_2_HAND,
                name: 'Player 2' as PlayerName,
                score: 195,
                isFiftyScoreHalved: false,
                isHundredScoreHalved: false,
                isYanivCalled: false,
                roundScore: { original: 0, adjusted: 0 },
              },
            ],
          }),
        );

        await endTurn(CODE, USER_2);

        const savedState = vi.mocked(setYanivState).mock
          .calls[0]?.[1] as Extract<
          GameState,
          { gameStage: GameStage.FINISHED }
        >;
        expect(savedState.winners).toEqual([USER_1]);
      });

      test('includes multiple winners when scores are tied for the lowest', async () => {
        const USER_3 = 'user-3' as UserId;
        // USER_1 called Yaniv (score=10, only caller) → gets +0, final score 10
        // USER_3 (score=5, hand=5) → +5, final score 10. Both tie.
        // USER_2 (score=195, hand=10) → +10, final score 205 (>200 → game over)
        vi.mocked(getYanivState).mockResolvedValue(
          makeYanivCalledState({
            currentPlayerId: USER_3,
            players: [
              {
                id: USER_1,
                cardCount: 2,
                hand: [
                  { suit: Suit.HEARTS, rank: Rank.ACE },
                  { suit: Suit.SPADES, rank: Rank.FOUR },
                ],
                name: 'Player 1' as PlayerName,
                score: 10,
                isFiftyScoreHalved: false,
                isHundredScoreHalved: false,
                isYanivCalled: true,
                roundScore: { original: 0, adjusted: 0 },
              },
              {
                id: USER_2,
                cardCount: 2,
                hand: [
                  { suit: Suit.DIAMONDS, rank: Rank.FOUR },
                  { suit: Suit.CLUBS, rank: Rank.SIX },
                ],
                name: 'Player 2' as PlayerName,
                score: 195,
                isFiftyScoreHalved: false,
                isHundredScoreHalved: false,
                isYanivCalled: false,
                roundScore: { original: 0, adjusted: 0 },
              },
              {
                id: USER_3,
                cardCount: 2,
                hand: [
                  { suit: Suit.HEARTS, rank: Rank.TWO },
                  { suit: Suit.SPADES, rank: Rank.THREE },
                ],
                name: 'Player 3' as PlayerName,
                score: 5,
                isFiftyScoreHalved: false,
                isHundredScoreHalved: false,
                isYanivCalled: false,
                roundScore: { original: 0, adjusted: 0 },
              },
            ],
          }),
        );

        await endTurn(CODE, USER_3);

        const savedState = vi.mocked(setYanivState).mock
          .calls[0]?.[1] as Extract<
          GameState,
          { gameStage: GameStage.FINISHED }
        >;
        expect(savedState.winners).toContain(USER_1);
        expect(savedState.winners).toContain(USER_3);
        expect(savedState.winners).not.toContain(USER_2);
      });

      test('preserves hands on players in finished state', async () => {
        const state = makeYanivCalledState({
          players: [
            {
              id: USER_1,
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
              cardCount: 2,
              hand: [
                { suit: Suit.DIAMONDS, rank: Rank.FOUR },
                { suit: Suit.CLUBS, rank: Rank.SIX },
              ],
              name: 'Player 2' as PlayerName,
              score: 195,
              isFiftyScoreHalved: false,
              isHundredScoreHalved: false,
              isYanivCalled: false,
              roundScore: { original: 0, adjusted: 0 },
            },
          ],
        });
        vi.mocked(getYanivState).mockResolvedValue(state);

        await endTurn(CODE, USER_2);

        const savedState = vi.mocked(setYanivState).mock
          .calls[0]?.[1] as Extract<
          GameState,
          { gameStage: GameStage.FINISHED }
        >;
        const user1 = savedState.players.find((p) => p.id === USER_1);
        const user2 = savedState.players.find((p) => p.id === USER_2);
        expect(user1?.hand).toEqual(state.players[0]?.hand);
        expect(user2?.hand).toEqual(state.players[1]?.hand);
      });
    });

    test('persists and publishes the updated state', async () => {
      await endTurn(CODE, USER_2);

      expect(vi.mocked(setYanivState)).toHaveBeenCalledOnce();
      expect(vi.mocked(publishYanivState)).toHaveBeenCalledOnce();
      expect(vi.mocked(setYanivState).mock.calls[0]?.[0]).toEqual({
        code: CODE,
      });
      const savedState = vi.mocked(setYanivState).mock.calls[0]?.[1];
      const publishedState = vi.mocked(publishYanivState).mock.calls[0]?.[1];
      expect(savedState).toEqual(publishedState);
    });
  });
});
