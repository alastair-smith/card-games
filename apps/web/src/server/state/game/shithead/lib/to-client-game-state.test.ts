import { describe, expect, test } from 'vitest';
import {
  buildFinishedState,
  buildInProgressState,
  buildPlayer,
  buildSwappingState,
} from '~/test-utils/shithead';
import { Rank, type StandardPlayingCard, Suit } from '~/types/cards';
import type { UserId } from '~/types/entities';
import { toClientGameState } from './to-client-game-state';

const USER_1 = 'user-1' as UserId;
const USER_2 = 'user-2' as UserId;

const USER_1_HAND: StandardPlayingCard[] = [
  { suit: Suit.HEARTS, rank: Rank.TWO },
  { suit: Suit.SPADES, rank: Rank.THREE },
];
const USER_2_HAND: StandardPlayingCard[] = [
  { suit: Suit.CLUBS, rank: Rank.FOUR },
];
const FACE_UP_CARD: StandardPlayingCard = {
  suit: Suit.DIAMONDS,
  rank: Rank.KING,
};
const FACE_DOWN_CARD: StandardPlayingCard = {
  suit: Suit.CLUBS,
  rank: Rank.ACE,
};

const makePlayers = () => [
  buildPlayer({
    id: USER_1,
    hand: USER_1_HAND,
    tableCards: [{ faceUpCard: FACE_UP_CARD, faceDownCard: FACE_DOWN_CARD }],
  }),
  buildPlayer({
    id: USER_2,
    hand: USER_2_HAND,
    tableCards: [{ faceUpCard: null, faceDownCard: null }],
    isSwapConfirmed: true,
  }),
];

describe('toClientGameState', () => {
  const states = [
    ['swapping', buildSwappingState({ players: makePlayers() })],
    [
      'in-progress',
      buildInProgressState({ players: makePlayers(), currentPlayerId: USER_1 }),
    ],
    ['finished', buildFinishedState({ players: makePlayers() })],
  ] as const;

  describe.each(states)('%s game', (_stageName, state) => {
    test('sends a player only their own hand', () => {
      const result = toClientGameState(state, USER_2);

      expect(result.hand).toEqual(USER_2_HAND);
      for (const player of result.players) {
        expect(player).not.toHaveProperty('hand');
      }
    });

    test("never sends anyone's face-down cards", () => {
      const result = toClientGameState(state, USER_1);

      expect(JSON.stringify(result)).not.toContain('faceDownCard');
      expect(result.players[0]?.tableCards).toEqual([
        { faceUpCard: FACE_UP_CARD, hasFaceDownCard: true },
      ]);
    });

    test("sends every player's face-up cards", () => {
      const result = toClientGameState(state, USER_2);

      expect(result.players[0]?.tableCards[0]?.faceUpCard).toEqual(
        FACE_UP_CARD,
      );
    });

    test('shows an emptied table slot as empty', () => {
      const result = toClientGameState(state, USER_1);

      expect(result.players[1]?.tableCards).toEqual([
        { faceUpCard: null, hasFaceDownCard: false },
      ]);
    });

    test('tells everyone how many cards each player holds', () => {
      const result = toClientGameState(state, USER_1);

      expect(result.players.map((player) => player.cardCount)).toEqual([2, 1]);
    });

    test('marks which player is the user', () => {
      const result = toClientGameState(state, USER_1);

      expect(result.players.map((player) => player.isUser)).toEqual([
        true,
        false,
      ]);
    });

    test('rejects someone who is not in the game', () => {
      expect(() => toClientGameState(state, 'other-user' as UserId)).toThrow(
        'Player not in game',
      );
    });
  });

  test('tells players who has confirmed their swaps', () => {
    const result = toClientGameState(
      buildSwappingState({ players: makePlayers() }),
      USER_1,
    );

    expect(result.players.map((player) => player.isSwapConfirmed)).toEqual([
      false,
      true,
    ]);
  });
});
