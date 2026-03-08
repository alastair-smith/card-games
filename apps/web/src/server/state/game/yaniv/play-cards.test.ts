import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { z } from 'zod';
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
import { isValidYanivPlay } from '~/utils/yaniv/validation';

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
vi.mock('~/server/data/discard', () => ({
  yanivDiscard: {
    peekDiscard: vi.fn(),
    pushDiscard: vi.fn(),
  },
}));
vi.mock('~/utils/yaniv/validation', () => ({
  isValidYanivPlay: vi.fn(),
}));

const { playCards } = await import('./play-cards');

const CODE = 'ABCDEF' as GameCode;
const USER_1 = 'user-1' as UserId;
const USER_2 = 'user-2' as UserId;

const CARD_1: YanivPlayingCard = { suit: Suit.HEARTS, rank: Rank.FIVE };
const CARD_2: YanivPlayingCard = { suit: Suit.SPADES, rank: Rank.SEVEN };
const TOP_DISCARD: YanivPlayingCard = { suit: Suit.CLUBS, rank: Rank.THREE };

const makeState = (overrides: Partial<State> = {}): State => ({
  gameStage: GameStage.IN_PROGRESS,
  gameStep: GameStep.PLAY_CARDS,
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
    vi.mocked(getYanivState).mockResolvedValue(makeState());
    vi.mocked(setYanivState).mockResolvedValue(makeState());
    vi.mocked(publishYanivState).mockResolvedValue(undefined);
    vi.mocked(yanivDiscard.peekDiscard).mockResolvedValue(TOP_DISCARD);
    vi.mocked(yanivDiscard.pushDiscard).mockResolvedValue(undefined);
    vi.mocked(isValidYanivPlay).mockReturnValue(makeValidPlay([CARD_1]));
  });

  test('throws when game not found', async () => {
    vi.mocked(getYanivState).mockResolvedValue(null);

    await expect(playCards(CODE, USER_1, [CARD_1])).rejects.toThrow(
      'Game not found',
    );
  });

  test('throws when game is not in progress', async () => {
    vi.mocked(getYanivState).mockResolvedValue({ gameStage: GameStage.LOBBY });

    await expect(playCards(CODE, USER_1, [CARD_1])).rejects.toThrow(
      'Game is not in progress',
    );
  });

  test('throws when not the play cards step', async () => {
    vi.mocked(getYanivState).mockResolvedValue(
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

  test('throws when hand not found', async () => {
    vi.mocked(getYanivState).mockResolvedValue(makeState({ hands: {} }));

    await expect(playCards(CODE, USER_1, [CARD_1])).rejects.toThrow(
      'Hand not found',
    );
  });

  test('throws when a card is not in the player hand', async () => {
    const notInHand: YanivPlayingCard = { suit: Suit.CLUBS, rank: Rank.KING };

    await expect(playCards(CODE, USER_1, [notInHand])).rejects.toThrow(
      'Card not in hand',
    );
  });

  test('throws when the combination is invalid', async () => {
    vi.mocked(isValidYanivPlay).mockReturnValue({ isValid: false });

    await expect(playCards(CODE, USER_1, [CARD_1])).rejects.toThrow(
      'Invalid card combination',
    );
  });

  test('removes played cards from the player hand', async () => {
    await playCards(CODE, USER_1, [CARD_1]);

    const newState = vi.mocked(setYanivState).mock.calls[0]?.[1];
    if (newState?.gameStage !== GameStage.IN_PROGRESS) {
      throw new Error('Game stage should be in progress');
    }
    expect(newState.hands?.[USER_1]).toEqual([CARD_2]);
  });

  test('decrements the player card count', async () => {
    await playCards(CODE, USER_1, [CARD_1]);

    const newState = vi.mocked(setYanivState).mock.calls[0]?.[1] as State;
    const player = newState.players.find((p) => p.id === USER_1);
    expect(player?.cardCount).toBe(1);
  });

  test('sets played cards using the ordered cards from validation', async () => {
    const orderedCards = [CARD_2, CARD_1];
    vi.mocked(isValidYanivPlay).mockReturnValue(makeValidPlay(orderedCards));
    vi.mocked(getYanivState).mockResolvedValue(
      makeState({ hands: { [USER_1]: [CARD_1, CARD_2] } }),
    );

    await playCards(CODE, USER_1, [CARD_1, CARD_2]);

    const newState = vi.mocked(setYanivState).mock.calls[0]?.[1] as State;
    expect(newState.playedCards).toEqual(orderedCards);
  });

  test('pushes ordered cards to the discard pile', async () => {
    const orderedCards = [CARD_1];
    vi.mocked(isValidYanivPlay).mockReturnValue(makeValidPlay(orderedCards));

    await playCards(CODE, USER_1, [CARD_1]);

    expect(vi.mocked(yanivDiscard.pushDiscard)).toHaveBeenCalledOnce();
    expect(vi.mocked(yanivDiscard.pushDiscard)).toHaveBeenCalledWith(
      CODE,
      orderedCards,
    );
  });

  test('advances to PICKUP_CARD when pickup is required', async () => {
    vi.mocked(isValidYanivPlay).mockReturnValue(makeValidPlay([CARD_1], true));

    await playCards(CODE, USER_1, [CARD_1]);

    const newState = vi.mocked(setYanivState).mock.calls[0]?.[1] as State;
    expect(newState.gameStep).toBe(GameStep.PICKUP_CARD);
  });

  test('advances to PROCEED when no pickup is required', async () => {
    vi.mocked(isValidYanivPlay).mockReturnValue(makeValidPlay([CARD_1], false));

    await playCards(CODE, USER_1, [CARD_1]);

    const newState = vi.mocked(setYanivState).mock.calls[0]?.[1] as State;
    expect(newState.gameStep).toBe(GameStep.PROCEED);
  });

  test('persists and publishes the updated state', async () => {
    await playCards(CODE, USER_1, [CARD_1]);

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
