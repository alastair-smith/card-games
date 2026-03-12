import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { z } from 'zod';
import { yanivDeck } from '~/server/data/deck';
import { yanivDiscard } from '~/server/data/discard';
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
vi.mock('~/server/data/deck', () => ({
  yanivDeck: {
    getDeckSize: vi.fn(),
    drawCard: vi.fn(),
    createDeck: vi.fn(),
  },
}));
vi.mock('~/server/data/discard', () => ({
  yanivDiscard: {
    drainDiscard: vi.fn(),
    popDiscard: vi.fn(),
    pushDiscard: vi.fn(),
  },
}));
vi.mock('~/utils/cards', () => ({
  shuffle: vi.fn((x) => x),
}));

const { pickupCard } = await import('./pickup-card');

const CODE = 'ABCDEF' as GameCode;
const USER_1 = 'user-1' as UserId;
const USER_2 = 'user-2' as UserId;

const CARD_1: YanivPlayingCard = { suit: Suit.HEARTS, rank: Rank.FIVE };
const CARD_2: YanivPlayingCard = { suit: Suit.SPADES, rank: Rank.SEVEN };
const DRAWN_CARD: YanivPlayingCard = { suit: Suit.CLUBS, rank: Rank.THREE };

const makeState = (overrides: Partial<State> = {}): State => ({
  gameStage: GameStage.IN_PROGRESS,
  gameStep: GameStep.PICKUP_CARD,
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
    [USER_1]: [CARD_1, CARD_2],
    [USER_2]: [
      { suit: Suit.DIAMONDS, rank: Rank.FOUR },
      { suit: Suit.CLUBS, rank: Rank.SIX },
    ],
  },
  playedCards: [{ suit: Suit.HEARTS, rank: Rank.TWO }],
  ...overrides,
});

describe('pickupCard', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getYanivState).mockResolvedValue(makeState());
    vi.mocked(setYanivState).mockResolvedValue(makeState());
    vi.mocked(publishYanivState).mockResolvedValue(undefined);
    vi.mocked(yanivDeck.getDeckSize).mockResolvedValue(10);
    vi.mocked(yanivDeck.drawCard).mockResolvedValue(DRAWN_CARD);
    vi.mocked(yanivDeck.createDeck).mockResolvedValue(undefined);
    vi.mocked(yanivDiscard.drainDiscard).mockResolvedValue([]);
    vi.mocked(yanivDiscard.popDiscard).mockResolvedValue(DRAWN_CARD);
    vi.mocked(yanivDiscard.pushDiscard).mockResolvedValue(undefined);
  });

  test('throws when game not found', async () => {
    vi.mocked(getYanivState).mockResolvedValue(null);

    await expect(pickupCard(CODE, USER_1, 'deck')).rejects.toThrow(
      'Game not found',
    );
  });

  test('throws when game is not in progress', async () => {
    vi.mocked(getYanivState).mockResolvedValue({ gameStage: GameStage.LOBBY });

    await expect(pickupCard(CODE, USER_1, 'deck')).rejects.toThrow(
      'Game is not in progress',
    );
  });

  test('throws when not the pickup card step', async () => {
    vi.mocked(getYanivState).mockResolvedValue(
      makeState({ gameStep: GameStep.PLAY_CARDS }),
    );

    await expect(pickupCard(CODE, USER_1, 'deck')).rejects.toThrow(
      'Not the pickup card step',
    );
  });

  test('throws when not the current player', async () => {
    await expect(pickupCard(CODE, USER_2, 'deck')).rejects.toThrow(
      'Not your turn',
    );
  });

  test('throws when deck is empty after reshuffle fails', async () => {
    vi.mocked(yanivDeck.getDeckSize).mockResolvedValue(0);
    vi.mocked(yanivDiscard.drainDiscard).mockResolvedValue([DRAWN_CARD]);
    vi.mocked(yanivDeck.drawCard).mockResolvedValue(null);

    await expect(pickupCard(CODE, USER_1, 'deck')).rejects.toThrow(
      'Deck is empty',
    );
  });

  test('throws when discard pile is empty', async () => {
    vi.mocked(yanivDiscard.popDiscard).mockResolvedValue(null);

    await expect(pickupCard(CODE, USER_1, 'discard')).rejects.toThrow(
      'Discard pile is empty',
    );
  });

  describe('deck source', () => {
    test('adds drawn card to hand', async () => {
      await pickupCard(CODE, USER_1, 'deck');

      expect(vi.mocked(setYanivState).mock.calls[0]?.[1]).toMatchObject({
        hands: { [USER_1]: [CARD_1, CARD_2, DRAWN_CARD] },
      });
    });

    test('increments card count', async () => {
      await pickupCard(CODE, USER_1, 'deck');

      expect(vi.mocked(setYanivState).mock.calls[0]?.[1]).toMatchObject({
        players: expect.arrayContaining([
          expect.objectContaining({ id: USER_1, cardCount: 3 }),
        ]),
      });
    });

    test('advances to PROCEED', async () => {
      await pickupCard(CODE, USER_1, 'deck');

      expect(vi.mocked(setYanivState).mock.calls[0]?.[1]).toMatchObject({
        gameStep: GameStep.PROCEED,
      });
    });

    test('persists drawn card in state', async () => {
      await pickupCard(CODE, USER_1, 'deck');

      expect(vi.mocked(setYanivState).mock.calls[0]?.[1]).toMatchObject({
        drawnCard: DRAWN_CARD,
      });
    });

    test('does not clear played cards', async () => {
      await pickupCard(CODE, USER_1, 'deck');

      expect(vi.mocked(setYanivState).mock.calls[0]?.[1]).toMatchObject({
        playedCards: makeState().playedCards,
      });
    });

    test('persists and publishes the updated state', async () => {
      await pickupCard(CODE, USER_1, 'deck');

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

    describe('reshuffle', () => {
      const TOP_CARD: YanivPlayingCard = { suit: Suit.HEARTS, rank: Rank.ACE };
      const CARD_A: YanivPlayingCard = { suit: Suit.CLUBS, rank: Rank.TWO };
      const CARD_B: YanivPlayingCard = {
        suit: Suit.DIAMONDS,
        rank: Rank.THREE,
      };

      beforeEach(() => {
        vi.mocked(yanivDeck.getDeckSize).mockResolvedValue(0);
        vi.mocked(yanivDiscard.drainDiscard).mockResolvedValue([
          TOP_CARD,
          CARD_A,
          CARD_B,
        ]);
        vi.mocked(yanivDeck.drawCard).mockResolvedValue(DRAWN_CARD);
      });

      test('drains the discard pile when deck is empty', async () => {
        await pickupCard(CODE, USER_1, 'deck');

        expect(vi.mocked(yanivDiscard.drainDiscard)).toHaveBeenCalledOnce();
        expect(vi.mocked(yanivDiscard.drainDiscard)).toHaveBeenCalledWith(CODE);
      });

      test('creates new deck with shuffled cards excluding top card', async () => {
        await pickupCard(CODE, USER_1, 'deck');

        expect(vi.mocked(yanivDeck.createDeck)).toHaveBeenCalledOnce();
        expect(vi.mocked(yanivDeck.createDeck)).toHaveBeenCalledWith(CODE, [
          CARD_A,
          CARD_B,
        ]);
      });

      test('restores top card to discard pile', async () => {
        await pickupCard(CODE, USER_1, 'deck');

        expect(vi.mocked(yanivDiscard.pushDiscard)).toHaveBeenCalledOnce();
        expect(vi.mocked(yanivDiscard.pushDiscard)).toHaveBeenCalledWith(
          CODE,
          TOP_CARD,
        );
      });
    });
  });

  describe('discard source', () => {
    test('adds popped card to hand', async () => {
      await pickupCard(CODE, USER_1, 'discard');

      expect(vi.mocked(setYanivState).mock.calls[0]?.[1]).toMatchObject({
        hands: { [USER_1]: [CARD_1, CARD_2, DRAWN_CARD] },
      });
    });

    test('increments card count', async () => {
      await pickupCard(CODE, USER_1, 'discard');

      expect(vi.mocked(setYanivState).mock.calls[0]?.[1]).toMatchObject({
        players: expect.arrayContaining([
          expect.objectContaining({ id: USER_1, cardCount: 3 }),
        ]),
      });
    });

    test('advances to PROCEED', async () => {
      await pickupCard(CODE, USER_1, 'discard');

      expect(vi.mocked(setYanivState).mock.calls[0]?.[1]).toMatchObject({
        gameStep: GameStep.PROCEED,
      });
    });

    test('does not set drawn card in state', async () => {
      await pickupCard(CODE, USER_1, 'discard');

      expect(vi.mocked(setYanivState).mock.calls[0]?.[1]).toHaveProperty(
        'drawnCard',
        undefined,
      );
    });

    test('persists and publishes the updated state', async () => {
      await pickupCard(CODE, USER_1, 'discard');

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
});
