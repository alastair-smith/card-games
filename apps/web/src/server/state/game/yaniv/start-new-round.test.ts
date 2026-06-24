import { beforeEach, describe, expect, test, vi } from 'vitest';
import { yanivDeck } from '~/server/data/deck';
import { yanivDiscard } from '~/server/data/discard';
import { getYanivState, setYanivState } from '~/server/data/yaniv';
import { publishYanivState } from '~/server/events/yaniv';
import { deckWithJokers, Rank, Suit } from '~/types/cards';
import type { PlayerName, UserId } from '~/types/entities';
import type { GameCode } from '~/types/game';
import {
  GameStage,
  type GameState,
  GameStep,
  HAND_SIZE,
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
  shuffle: vi.fn((x) => x),
}));

const { startNewRound } = await import('./start-new-round');

const CODE = 'ABCDEF' as GameCode;
const USER_1 = 'user-1' as UserId;
const USER_2 = 'user-2' as UserId;

const SEED_CARD: YanivPlayingCard = { suit: Suit.HEARTS, rank: Rank.ACE };
const USER_1_CARDS: YanivPlayingCard[] = [
  { suit: Suit.HEARTS, rank: Rank.TWO },
  { suit: Suit.SPADES, rank: Rank.THREE },
  { suit: Suit.CLUBS, rank: Rank.FOUR },
  { suit: Suit.DIAMONDS, rank: Rank.FIVE },
  { suit: Suit.HEARTS, rank: Rank.SIX },
  { suit: Suit.SPADES, rank: Rank.SEVEN },
  { suit: Suit.CLUBS, rank: Rank.EIGHT },
];
const USER_2_CARDS: YanivPlayingCard[] = [
  { suit: Suit.DIAMONDS, rank: Rank.NINE },
  { suit: Suit.HEARTS, rank: Rank.TEN },
  { suit: Suit.SPADES, rank: Rank.JACK },
  { suit: Suit.CLUBS, rank: Rank.QUEEN },
  { suit: Suit.DIAMONDS, rank: Rank.KING },
  { suit: Suit.HEARTS, rank: Rank.ACE },
  { suit: Suit.SPADES, rank: Rank.TWO },
];

const makeState = (overrides: Partial<State> = {}): State => ({
  gameStage: GameStage.IN_PROGRESS,
  gameStep: GameStep.REDEAL,
  currentPlayerId: USER_1,
  players: [
    {
      id: USER_1,
      color: 'hsl(210 70% 48%)',
      cardCount: 3,
      hand: [{ suit: Suit.HEARTS, rank: Rank.TWO }],
      name: 'Player 1' as PlayerName,
      score: 10,
      isFiftyScoreHalved: false,
      isHundredScoreHalved: false,
      isYanivCalled: true,
      roundScore: { original: 3, adjusted: 3 },
    },
    {
      id: USER_2,
      color: 'hsl(210 70% 48%)',
      cardCount: 5,
      hand: [{ suit: Suit.SPADES, rank: Rank.FIVE }],
      name: 'Player 2' as PlayerName,
      score: 20,
      isFiftyScoreHalved: false,
      isHundredScoreHalved: false,
      isYanivCalled: false,
      roundScore: { original: 5, adjusted: 5 },
    },
  ],
  playedCards: [{ suit: Suit.CLUBS, rank: Rank.THREE }],
  ...overrides,
});

describe('startNewRound', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getYanivState).mockResolvedValue(makeState());
    vi.mocked(setYanivState).mockResolvedValue(makeState());
    vi.mocked(publishYanivState).mockResolvedValue(undefined);
    vi.mocked(yanivDeck.createDeck).mockResolvedValue(undefined);
    vi.mocked(yanivDeck.drawCards)
      .mockResolvedValueOnce(USER_1_CARDS)
      .mockResolvedValueOnce(USER_2_CARDS);
    vi.mocked(yanivDeck.drawCard).mockResolvedValue(SEED_CARD);
    vi.mocked(yanivDiscard.createDiscard).mockResolvedValue(undefined);
    vi.mocked(yanivDiscard.pushDiscard).mockResolvedValue(undefined);
  });

  test('throws when game not found', async () => {
    vi.mocked(getYanivState).mockResolvedValue(null);

    await expect(startNewRound(CODE, USER_1)).rejects.toThrow('Game not found');
  });

  test('throws when game is not in progress', async () => {
    vi.mocked(getYanivState).mockResolvedValue({ gameStage: GameStage.LOBBY });

    await expect(startNewRound(CODE, USER_1)).rejects.toThrow(
      'Game is not in progress',
    );
  });

  test('throws when not the redeal step', async () => {
    vi.mocked(getYanivState).mockResolvedValue(
      makeState({ gameStep: GameStep.PLAY_CARDS }),
    );

    await expect(startNewRound(CODE, USER_1)).rejects.toThrow(
      'Not the redeal step',
    );
  });

  test('throws when not the current player', async () => {
    await expect(startNewRound(CODE, USER_2)).rejects.toThrow('Not your turn');
  });

  test('throws when deck runs out seeding discard', async () => {
    vi.mocked(yanivDeck.drawCard).mockResolvedValue(null);

    await expect(startNewRound(CODE, USER_1)).rejects.toThrow(
      'Deck ran out of cards seeding discard',
    );
  });

  test('resets isYanivCalled for all players', async () => {
    await startNewRound(CODE, USER_1);

    const savedState = vi.mocked(setYanivState).mock.calls[0]?.[1];
    expect(savedState).toMatchObject({
      players: expect.arrayContaining([
        expect.objectContaining({ id: USER_1, isYanivCalled: false }),
        expect.objectContaining({ id: USER_2, isYanivCalled: false }),
      ]),
    });
  });

  test('sets card count to hand size for each player', async () => {
    await startNewRound(CODE, USER_1);

    const savedState = vi.mocked(setYanivState).mock.calls[0]?.[1];
    expect(savedState).toMatchObject({
      players: expect.arrayContaining([
        expect.objectContaining({
          id: USER_1,
          color: 'hsl(210 70% 48%)',
          cardCount: HAND_SIZE,
        }),
        expect.objectContaining({
          id: USER_2,
          color: 'hsl(210 70% 48%)',
          cardCount: HAND_SIZE,
        }),
      ]),
    });
  });

  test('deals hands to all players', async () => {
    await startNewRound(CODE, USER_1);

    const savedState = vi.mocked(setYanivState).mock.calls[0]?.[1] as State;
    expect(savedState.players.find(({ id }) => id === USER_1)?.hand).toEqual(
      USER_1_CARDS,
    );
    expect(savedState.players.find(({ id }) => id === USER_2)?.hand).toEqual(
      USER_2_CARDS,
    );
  });

  test('clears played cards', async () => {
    await startNewRound(CODE, USER_1);

    const savedState = vi.mocked(setYanivState).mock.calls[0]?.[1];
    expect(savedState).toMatchObject({ playedCards: [] });
  });

  test('transitions to PLAY_CARDS', async () => {
    await startNewRound(CODE, USER_1);

    const savedState = vi.mocked(setYanivState).mock.calls[0]?.[1];
    expect(savedState).toMatchObject({ gameStep: GameStep.PLAY_CARDS });
  });

  test('keeps current player unchanged', async () => {
    await startNewRound(CODE, USER_1);

    const savedState = vi.mocked(setYanivState).mock.calls[0]?.[1];
    expect(savedState).toMatchObject({ currentPlayerId: USER_1 });
  });

  test('creates deck with shuffled full deck', async () => {
    await startNewRound(CODE, USER_1);

    expect(vi.mocked(yanivDeck.createDeck)).toHaveBeenCalledOnce();
    expect(vi.mocked(yanivDeck.createDeck)).toHaveBeenCalledWith(
      CODE,
      deckWithJokers,
    );
  });

  test('creates fresh discard pile and seeds it with one card', async () => {
    await startNewRound(CODE, USER_1);

    expect(vi.mocked(yanivDiscard.createDiscard)).toHaveBeenCalledOnce();
    expect(vi.mocked(yanivDiscard.createDiscard)).toHaveBeenCalledWith(CODE);
    expect(vi.mocked(yanivDiscard.pushDiscard)).toHaveBeenCalledOnce();
    expect(vi.mocked(yanivDiscard.pushDiscard)).toHaveBeenCalledWith(
      CODE,
      SEED_CARD,
    );
  });

  test('persists and publishes the updated state', async () => {
    await startNewRound(CODE, USER_1);

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
