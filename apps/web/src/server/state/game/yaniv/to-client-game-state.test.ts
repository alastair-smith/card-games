import { describe, expect, test } from 'vitest';
import { Rank, Suit } from '~/types/cards';
import type { PlayerName, UserId } from '~/types/entities';
import {
  DEFAULT_HAND_SIZE,
  GameStage,
  type GameState,
  GameStep,
  type YanivPlayingCard,
} from '~/types/games/yaniv';
import { toClientGameState } from './to-client-game-state';

type InProgressState = Extract<GameState, { gameStage: GameStage.IN_PROGRESS }>;
type FinishedState = Extract<GameState, { gameStage: GameStage.FINISHED }>;

const USER_1 = 'user-1' as UserId;
const USER_2 = 'user-2' as UserId;

const USER_1_CARDS: YanivPlayingCard[] = [
  { suit: Suit.HEARTS, rank: Rank.TWO },
  { suit: Suit.SPADES, rank: Rank.THREE },
];
const USER_2_CARDS: YanivPlayingCard[] = [
  { suit: Suit.CLUBS, rank: Rank.FOUR },
  { suit: Suit.DIAMONDS, rank: Rank.FIVE },
];

const makePlayers = (): InProgressState['players'] => [
  {
    id: USER_1,
    color: 'cyan',
    cardCount: 2,
    hand: USER_1_CARDS,
    name: 'Player 1' as PlayerName,
    score: 10,
    isFiftyScoreHalved: false,
    isHundredScoreHalved: false,
    isYanivCalled: false,
    roundScore: { original: 10, adjusted: 10 },
  },
  {
    id: USER_2,
    color: 'cyan',
    cardCount: 2,
    hand: USER_2_CARDS,
    name: 'Player 2' as PlayerName,
    score: 20,
    isFiftyScoreHalved: false,
    isHundredScoreHalved: false,
    isYanivCalled: false,
    roundScore: { original: 20, adjusted: 20 },
  },
];

const makeInProgressState = (
  overrides: Partial<InProgressState> = {},
): InProgressState => ({
  gameStage: GameStage.IN_PROGRESS,
  gameStep: GameStep.PLAY_CARDS,
  handSize: DEFAULT_HAND_SIZE,
  currentPlayerId: USER_1,
  players: makePlayers(),
  playedCards: [],
  ...overrides,
});

const makeFinishedState = (
  overrides: Partial<FinishedState> = {},
): FinishedState => ({
  gameStage: GameStage.FINISHED,
  players: makePlayers(),
  winners: [USER_1],
  ...overrides,
});

describe('toClientGameState', () => {
  test('returns correct hand for requesting user', () => {
    const result = toClientGameState(makeInProgressState(), USER_1);

    expect(result.hand).toEqual(USER_1_CARDS);
  });

  test('throws when requesting user is not in the game', () => {
    expect(() =>
      toClientGameState(makeInProgressState(), 'other-user' as UserId),
    ).toThrow('Player not in game');
  });

  test('decorates requesting user with isUser true', () => {
    const result = toClientGameState(makeInProgressState(), USER_1);

    expect(result.players).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: USER_1, isUser: true }),
      ]),
    );
  });

  test('decorates other players with isUser false', () => {
    const result = toClientGameState(makeInProgressState(), USER_1);

    expect(result.players).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: USER_2, isUser: false }),
      ]),
    );
  });

  test('does not include hand on player objects', () => {
    const result = toClientGameState(makeInProgressState(), USER_1);

    for (const player of result.players) {
      expect(player).not.toHaveProperty('hand');
    }
  });

  describe('drawn card visibility', () => {
    const DRAWN_CARD: YanivPlayingCard = { suit: Suit.HEARTS, rank: Rank.ACE };

    test('includes drawn card for the player who drew it', () => {
      const state = makeInProgressState({
        currentPlayerId: USER_1,
        drawnCard: DRAWN_CARD,
      });

      const result = toClientGameState(state, USER_1);
      if (result.gameStage !== GameStage.IN_PROGRESS)
        throw new Error('Expected IN_PROGRESS state');

      expect(result.drawnCard).toEqual(DRAWN_CARD);
    });

    test('hides drawn card from other players', () => {
      const state = makeInProgressState({
        currentPlayerId: USER_1,
        drawnCard: DRAWN_CARD,
      });

      const result = toClientGameState(state, USER_2);
      if (result.gameStage !== GameStage.IN_PROGRESS)
        throw new Error('Expected IN_PROGRESS state');

      expect(result.drawnCard).toBeUndefined();
    });
  });

  describe('finished game', () => {
    test('returns correct hand for requesting user', () => {
      const result = toClientGameState(makeFinishedState(), USER_2);

      expect(result.hand).toEqual(USER_2_CARDS);
    });

    test('throws when requesting user is not in the game', () => {
      expect(() =>
        toClientGameState(makeFinishedState(), 'other-user' as UserId),
      ).toThrow('Player not in game');
    });

    test('decorates players with isUser correctly', () => {
      const result = toClientGameState(makeFinishedState(), USER_1);

      expect(result.players).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: USER_1, isUser: true }),
          expect.objectContaining({ id: USER_2, isUser: false }),
        ]),
      );
    });

    test('does not include hands in the returned state', () => {
      const result = toClientGameState(makeFinishedState(), USER_1);

      expect(result).not.toHaveProperty('hands');
    });
  });
});
