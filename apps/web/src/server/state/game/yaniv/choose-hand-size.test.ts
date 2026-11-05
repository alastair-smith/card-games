import { beforeEach, describe, expect, test, vi } from 'vitest';
import { yanivDeck } from '~/server/data/deck';
import { yanivDiscard } from '~/server/data/discard';
import { getYanivState, setYanivState } from '~/server/data/yaniv';
import { publishYanivState } from '~/server/events/yaniv';
import {
  buildInProgressState,
  buildPlayer,
  expectInProgressState,
} from '~/test-utils/yaniv';
import { Rank, Suit } from '~/types/cards';
import type { UserId } from '~/types/entities';
import type { GameCode } from '~/types/game';
import {
  GameStage,
  type GameState,
  GameStep,
  WINNER_CHOOSES_HAND_SIZE,
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
    createDeck: vi.fn(),
    drawCard: vi.fn(),
    drawCards: vi.fn(),
  },
}));
vi.mock('~/server/data/discard', () => ({
  yanivDiscard: {
    createDiscard: vi.fn(),
    pushDiscard: vi.fn(),
  },
}));
vi.mock('~/utils/cards/index', () => ({
  shuffle: vi.fn((cards) => cards),
}));

const { chooseHandSize } = await import('./choose-hand-size');

const CODE = 'ABCDEF' as GameCode;
const WINNER = 'user-1' as UserId;
const DEALER = 'user-2' as UserId;

const SEED_CARD: YanivPlayingCard = { suit: Suit.HEARTS, rank: Rank.ACE };
const DEALT_CARDS: YanivPlayingCard[] = [
  { suit: Suit.CLUBS, rank: Rank.TWO },
  { suit: Suit.SPADES, rank: Rank.THREE },
  { suit: Suit.DIAMONDS, rank: Rank.FOUR },
];

const makeState = (overrides: Partial<State> = {}): State =>
  buildInProgressState({
    gameStep: GameStep.CHOOSE_HAND_SIZE,
    settings: { handSize: WINNER_CHOOSES_HAND_SIZE },
    handSize: null,
    currentPlayerId: WINNER,
    dealerId: WINNER,
    players: [
      buildPlayer({ id: WINNER, isYanivCalled: true }),
      buildPlayer({ id: DEALER }),
    ],
    ...overrides,
  });

const getSavedState = () =>
  expectInProgressState(vi.mocked(setYanivState).mock.calls[0]?.[1]);

describe('chooseHandSize', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getYanivState).mockResolvedValue(makeState());
    vi.mocked(yanivDeck.drawCards).mockResolvedValue(DEALT_CARDS);
    vi.mocked(yanivDeck.drawCard).mockResolvedValue(SEED_CARD);
  });

  test('throws when game not found', async () => {
    vi.mocked(getYanivState).mockResolvedValue(null);

    await expect(chooseHandSize(CODE, WINNER, 3)).rejects.toThrow(
      'Game not found',
    );
  });

  test('throws when game is not in progress', async () => {
    vi.mocked(getYanivState).mockResolvedValue({ gameStage: GameStage.LOBBY });

    await expect(chooseHandSize(CODE, WINNER, 3)).rejects.toThrow(
      'Game is not in progress',
    );
  });

  test('throws when it is not time to choose the hand size', async () => {
    vi.mocked(getYanivState).mockResolvedValue(
      makeState({ gameStep: GameStep.REDEAL }),
    );

    await expect(chooseHandSize(CODE, WINNER, 3)).rejects.toThrow(
      'Not the choose hand size step',
    );
  });

  test('throws when someone other than the winner chooses', async () => {
    await expect(chooseHandSize(CODE, DEALER, 3)).rejects.toThrow(
      'Not your turn',
    );
    expect(vi.mocked(setYanivState)).not.toHaveBeenCalled();
  });

  describe('when the winner also deals', () => {
    test('deals the chosen number of cards to every player', async () => {
      await chooseHandSize(CODE, WINNER, 3);

      expect(vi.mocked(yanivDeck.drawCards)).toHaveBeenCalledTimes(2);
      expect(vi.mocked(yanivDeck.drawCards)).toHaveBeenCalledWith(CODE, 3);
      expect(vi.mocked(yanivDiscard.pushDiscard)).toHaveBeenCalledWith(
        CODE,
        SEED_CARD,
      );
      for (const player of getSavedState().players) {
        expect(player.hand).toEqual(DEALT_CARDS);
        expect(player.isYanivCalled).toBe(false);
      }
    });

    test('starts the round with the winner playing first', async () => {
      await chooseHandSize(CODE, WINNER, 3);

      expect(getSavedState()).toMatchObject({
        gameStep: GameStep.PLAY_CARDS,
        handSize: 3,
        currentPlayerId: WINNER,
        playedCards: [],
        drawnFrom: null,
      });
    });
  });

  describe('when someone else deals', () => {
    beforeEach(() => {
      vi.mocked(getYanivState).mockResolvedValue(
        makeState({ dealerId: DEALER }),
      );
    });

    test('leaves the dealing to the dealer', async () => {
      await chooseHandSize(CODE, WINNER, 3);

      expect(vi.mocked(yanivDeck.createDeck)).not.toHaveBeenCalled();
      expect(getSavedState()).toMatchObject({
        gameStep: GameStep.REDEAL,
        handSize: 3,
        currentPlayerId: DEALER,
      });
    });
  });

  test('persists and publishes the updated state', async () => {
    await chooseHandSize(CODE, WINNER, 3);

    expect(vi.mocked(setYanivState)).toHaveBeenCalledOnce();
    expect(vi.mocked(publishYanivState)).toHaveBeenCalledOnce();
    expect(vi.mocked(publishYanivState)).toHaveBeenCalledWith(
      CODE,
      getSavedState(),
    );
  });
});
