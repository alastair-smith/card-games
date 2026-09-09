import { beforeEach, describe, expect, test, vi } from 'vitest';
import { yanivDeck } from '~/server/data/deck';
import { yanivDiscard } from '~/server/data/discard';
import { getYanivState, setYanivState } from '~/server/data/yaniv';
import { publishYanivState } from '~/server/events/yaniv';
import { Rank, Suit } from '~/types/cards';
import type { PlayerName, UserId } from '~/types/entities';
import type { GameCode } from '~/types/game';
import {
  DEFAULT_HAND_SIZE,
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
vi.mock('~/server/data/deck', () => ({
  yanivDeck: {
    getDeckSize: vi.fn(),
    drawCard: vi.fn(),
  },
}));
vi.mock('~/server/data/discard', () => ({
  yanivDiscard: {
    popDiscard: vi.fn(),
  },
}));
vi.mock('./reshuffle-deck', () => ({
  reshuffleDeck: vi.fn(),
}));

const { pickupCard } = await import('./pickup-card');
const { reshuffleDeck } = await import('./reshuffle-deck');

const CODE = 'ABCDEF' as GameCode;
const USER_1 = 'user-1' as UserId;
const USER_2 = 'user-2' as UserId;

const CARD_1: YanivPlayingCard = { suit: Suit.HEARTS, rank: Rank.FIVE };
const CARD_2: YanivPlayingCard = { suit: Suit.SPADES, rank: Rank.SEVEN };
const DRAWN_CARD: YanivPlayingCard = { suit: Suit.CLUBS, rank: Rank.THREE };

const makeState = (overrides: Partial<State> = {}): State => ({
  gameStage: GameStage.IN_PROGRESS,
  gameStep: GameStep.PICKUP_CARD,
  handSize: DEFAULT_HAND_SIZE,
  currentPlayerId: USER_1,
  players: [
    {
      id: USER_1,
      color: 'cyan',
      cardCount: 2,
      hand: [CARD_1, CARD_2],
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
    vi.mocked(yanivDiscard.popDiscard).mockResolvedValue(DRAWN_CARD);
    vi.mocked(reshuffleDeck).mockResolvedValue(undefined);
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

  test('throws when deck is empty after reshuffle', async () => {
    vi.mocked(yanivDeck.getDeckSize).mockResolvedValue(0);
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

  test('throws when attempting to pick up from discard after a run extension', async () => {
    vi.mocked(getYanivState).mockResolvedValue(
      makeState({ deckOnlyPickup: true }),
    );

    await expect(pickupCard(CODE, USER_1, 'discard')).rejects.toThrow(
      'Cannot pick up from the discard after playing a run extension',
    );
  });

  test('allows discard pickup after a standalone run (no run extension played)', async () => {
    vi.mocked(getYanivState).mockResolvedValue(
      makeState({ deckOnlyPickup: false }),
    );

    await expect(pickupCard(CODE, USER_1, 'discard')).resolves.not.toThrow();
  });

  describe('deck source (allowed even after a run extension)', () => {
    test('adds drawn card to hand', async () => {
      await pickupCard(CODE, USER_1, 'deck');

      const savedState = vi.mocked(setYanivState).mock.calls[0]?.[1] as State;
      expect(savedState.players.find(({ id }) => id === USER_1)?.hand).toEqual([
        CARD_1,
        CARD_2,
        DRAWN_CARD,
      ]);
    });

    test('increments card count', async () => {
      await pickupCard(CODE, USER_1, 'deck');

      expect(vi.mocked(setYanivState).mock.calls[0]?.[1]).toMatchObject({
        players: expect.arrayContaining([
          expect.objectContaining({
            id: USER_1,
            color: 'cyan',
            cardCount: 3,
          }),
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

    test('reshuffles the deck when deck is empty', async () => {
      vi.mocked(yanivDeck.getDeckSize).mockResolvedValue(0);

      await pickupCard(CODE, USER_1, 'deck');

      expect(vi.mocked(reshuffleDeck)).toHaveBeenCalledOnce();
      expect(vi.mocked(reshuffleDeck)).toHaveBeenCalledWith(CODE);
    });

    test('does not reshuffle when deck has cards', async () => {
      await pickupCard(CODE, USER_1, 'deck');

      expect(vi.mocked(reshuffleDeck)).not.toHaveBeenCalled();
    });

    test('clears the deck-only pickup restriction', async () => {
      vi.mocked(getYanivState).mockResolvedValue(
        makeState({ deckOnlyPickup: true }),
      );

      await pickupCard(CODE, USER_1, 'deck');

      expect(vi.mocked(setYanivState).mock.calls[0]?.[1]).toHaveProperty(
        'deckOnlyPickup',
        undefined,
      );
    });
  });

  describe('discard source', () => {
    test('adds popped card to hand', async () => {
      await pickupCard(CODE, USER_1, 'discard');

      const savedState = vi.mocked(setYanivState).mock.calls[0]?.[1] as State;
      expect(savedState.players.find(({ id }) => id === USER_1)?.hand).toEqual([
        CARD_1,
        CARD_2,
        DRAWN_CARD,
      ]);
    });

    test('increments card count', async () => {
      await pickupCard(CODE, USER_1, 'discard');

      expect(vi.mocked(setYanivState).mock.calls[0]?.[1]).toMatchObject({
        players: expect.arrayContaining([
          expect.objectContaining({
            id: USER_1,
            color: 'cyan',
            cardCount: 3,
          }),
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
