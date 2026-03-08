import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Rank, Suit } from '~/types/cards';
import type { UserId } from '~/types/entities';
import type { GameCode } from '~/types/game';
import {
  GameStage,
  GameStep,
  type YanivPlayingCard,
} from '~/types/games/yaniv';

const mockGetYanivState = vi.fn();
const mockSetYanivState = vi.fn();
const mockPublishYanivState = vi.fn();
const mockPeekDiscard = vi.fn();
const mockPushDiscard = vi.fn();
const mockIsValidYanivPlay = vi.fn();

vi.mock('~/server/data/yaniv', () => ({
  getYanivState: mockGetYanivState,
  setYanivState: mockSetYanivState,
}));
vi.mock('~/server/events/yaniv', () => ({
  publishYanivState: mockPublishYanivState,
}));
vi.mock('~/server/data/discard', () => ({
  yanivDiscard: {
    peekDiscard: mockPeekDiscard,
    pushDiscard: mockPushDiscard,
  },
}));
vi.mock('~/utils/yaniv/validation', () => ({
  isValidYanivPlay: mockIsValidYanivPlay,
}));

const { playCards } = await import('./play-cards');

const CODE = 'ABCDEF' as GameCode;
const USER_1 = 'user-1' as UserId;
const USER_2 = 'user-2' as UserId;

const CARD_1: YanivPlayingCard = { suit: Suit.HEARTS, rank: Rank.FIVE };
const CARD_2: YanivPlayingCard = { suit: Suit.SPADES, rank: Rank.SEVEN };
const TOP_DISCARD: YanivPlayingCard = { suit: Suit.CLUBS, rank: Rank.THREE };

const makeState = (overrides = {}) => ({
  gameStage: GameStage.IN_PROGRESS,
  gameStep: GameStep.PLAY_CARDS,
  currentPlayerId: USER_1,
  players: [
    {
      id: USER_1,
      cardCount: 2,
      name: 'Player 1',
      score: 0,
      isFiftyScoreHalved: false,
      isHundredScoreHalved: false,
      isYanivCalled: false,
    },
    {
      id: USER_2,
      cardCount: 2,
      name: 'Player 2',
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
  playedCards: [],
  ...overrides,
});

const makeValidPlay = (
  orderedCards: YanivPlayingCard[],
  isPickupRequired = true,
) => ({
  isValid: true,
  isPickupRequired,
  orderedCards,
});

describe('playCards', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetYanivState.mockResolvedValue(makeState());
    mockSetYanivState.mockResolvedValue(undefined);
    mockPublishYanivState.mockResolvedValue(undefined);
    mockPeekDiscard.mockResolvedValue(TOP_DISCARD);
    mockPushDiscard.mockResolvedValue(undefined);
    mockIsValidYanivPlay.mockReturnValue(makeValidPlay([CARD_1]));
  });

  test('throws when game not found', async () => {
    mockGetYanivState.mockResolvedValue(null);
    await expect(playCards(CODE, USER_1, [CARD_1])).rejects.toThrow(
      'Game not found',
    );
  });

  test('throws when game is not in progress', async () => {
    mockGetYanivState.mockResolvedValue(
      makeState({ gameStage: GameStage.LOBBY }),
    );
    await expect(playCards(CODE, USER_1, [CARD_1])).rejects.toThrow(
      'Game is not in progress',
    );
  });

  test('throws when not the play cards step', async () => {
    mockGetYanivState.mockResolvedValue(
      makeState({ gameStep: GameStep.PICKUP_CARD }),
    );
    await expect(playCards(CODE, USER_1, [CARD_1])).rejects.toThrow(
      'Not the play cards step',
    );
  });

  test('throws when not the current player', async () => {
    await expect(playCards(CODE, USER_2, [CARD_1])).rejects.toThrow(
      'Not your turn',
    );
  });

  test('throws when a card is not in the player hand', async () => {
    const notInHand: YanivPlayingCard = { suit: Suit.CLUBS, rank: Rank.KING };
    await expect(playCards(CODE, USER_1, [notInHand])).rejects.toThrow(
      'Card not in hand',
    );
  });

  test('throws when the combination is invalid', async () => {
    mockIsValidYanivPlay.mockReturnValue({ isValid: false });
    await expect(playCards(CODE, USER_1, [CARD_1])).rejects.toThrow(
      'Invalid card combination',
    );
  });

  test('removes played cards from the player hand', async () => {
    await playCards(CODE, USER_1, [CARD_1]);
    const newState = mockSetYanivState.mock.calls[0]?.[1] as {
      hands: Record<string, YanivPlayingCard[]>;
    };
    expect(newState.hands[USER_1]).toEqual([CARD_2]);
  });

  test('decrements the player card count', async () => {
    await playCards(CODE, USER_1, [CARD_1]);
    const newState = mockSetYanivState.mock.calls[0]?.[1] as {
      players: Array<{ id: UserId; cardCount: number }>;
    };
    const player = newState.players.find((p) => p.id === USER_1);
    expect(player?.cardCount).toBe(1);
  });

  test('sets played cards using the ordered cards from validation', async () => {
    const orderedCards = [CARD_2, CARD_1];
    mockIsValidYanivPlay.mockReturnValue(makeValidPlay(orderedCards));
    mockGetYanivState.mockResolvedValue(
      makeState({ hands: { [USER_1]: [CARD_1, CARD_2] } }),
    );
    await playCards(CODE, USER_1, [CARD_1, CARD_2]);
    const newState = mockSetYanivState.mock.calls[0]?.[1] as {
      playedCards: YanivPlayingCard[];
    };
    expect(newState.playedCards).toEqual(orderedCards);
  });

  test('pushes ordered cards to the discard pile', async () => {
    const orderedCards = [CARD_1];
    mockIsValidYanivPlay.mockReturnValue(makeValidPlay(orderedCards));
    await playCards(CODE, USER_1, [CARD_1]);
    expect(mockPushDiscard).toHaveBeenCalledOnce();
    expect(mockPushDiscard).toHaveBeenCalledWith(CODE, orderedCards);
  });

  test('advances to PICKUP_CARD when pickup is required', async () => {
    mockIsValidYanivPlay.mockReturnValue(makeValidPlay([CARD_1], true));
    await playCards(CODE, USER_1, [CARD_1]);
    const newState = mockSetYanivState.mock.calls[0]?.[1] as {
      gameStep: GameStep;
    };
    expect(newState.gameStep).toBe(GameStep.PICKUP_CARD);
  });

  test('advances to PROCEED when no pickup is required', async () => {
    mockIsValidYanivPlay.mockReturnValue(makeValidPlay([CARD_1], false));
    await playCards(CODE, USER_1, [CARD_1]);
    const newState = mockSetYanivState.mock.calls[0]?.[1] as {
      gameStep: GameStep;
    };
    expect(newState.gameStep).toBe(GameStep.PROCEED);
  });

  test('persists and publishes the updated state', async () => {
    await playCards(CODE, USER_1, [CARD_1]);
    expect(mockSetYanivState).toHaveBeenCalledOnce();
    expect(mockSetYanivState).toHaveBeenCalledWith(
      { code: CODE },
      expect.objectContaining({ gameStage: GameStage.IN_PROGRESS }),
    );
    expect(mockPublishYanivState).toHaveBeenCalledOnce();
    expect(mockPublishYanivState).toHaveBeenCalledWith(
      CODE,
      expect.objectContaining({ gameStage: GameStage.IN_PROGRESS }),
    );
  });
});
