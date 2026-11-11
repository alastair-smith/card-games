import { describe, expect, test } from 'vitest';
import {
  buildFinishedState,
  buildInProgressState,
  buildPlayer,
  buildSwappingState,
} from '~/test-utils/shithead';
import { Rank, Suit, standardDeck } from '~/types/cards';
import type { UserId } from '~/types/entities';
import { GameStage } from '~/types/games/shithead';
import { toClientGameState } from './to-client-game-state';

const USER_1 = 'user-1' as UserId;
const USER_2 = 'user-2' as UserId;

const undealtCards = [...standardDeck];
const takeCards = (count: number) => undealtCards.splice(0, count);

const dealPlayer = (id: UserId) => {
  const hand = takeCards(3);
  const faceUpCards = takeCards(3);
  const faceDownCards = takeCards(3);
  return buildPlayer({
    id,
    hand,
    tableCards: faceUpCards.map((faceUpCard, slotIndex) => ({
      faceUpCard,
      faceDownCard: faceDownCards[slotIndex] ?? null,
    })),
  });
};

const USER_1_DEALT = dealPlayer(USER_1);
const USER_2_DEALT = dealPlayer(USER_2);

const swappingState = buildSwappingState({
  players: [USER_1_DEALT, { ...USER_2_DEALT, isSwapConfirmed: true }],
});

// User 1 has played out their hand and one face-up card
const USER_1_PLAYING_FACE_UP = {
  ...USER_1_DEALT,
  hand: [],
  isSwapConfirmed: true,
  tableCards: USER_1_DEALT.tableCards.map((slot, slotIndex) =>
    slotIndex === 0 ? { ...slot, faceUpCard: null } : slot,
  ),
};

const inProgressState = buildInProgressState({
  players: [USER_1_PLAYING_FACE_UP, { ...USER_2_DEALT, isSwapConfirmed: true }],
  currentPlayerId: USER_2,
});

const finishedState = buildFinishedState({
  players: [
    {
      ...USER_1_DEALT,
      hand: [],
      isSwapConfirmed: true,
      tableCards: USER_1_DEALT.tableCards.map(() => ({
        faceUpCard: null,
        faceDownCard: null,
      })),
    },
    { ...USER_2_DEALT, isSwapConfirmed: true },
  ],
  finishingOrder: [USER_1, USER_2],
});

// Hearts, as the deal above only reaches the diamonds
const DISCARD_PILE = [
  { suit: Suit.HEARTS, rank: Rank.FIVE },
  { suit: Suit.HEARTS, rank: Rank.NINE },
  { suit: Suit.HEARTS, rank: Rank.TWO },
];

// 52 cards less the 18 dealt and the 3 on the discard pile
const TABLE = { discardCards: DISCARD_PILE, deckSize: 31 };

describe('toClientGameState', () => {
  describe.each([
    ['swapping', swappingState],
    ['in-progress', inProgressState],
    ['finished', finishedState],
  ])('%s game', (_stageName, state) => {
    test('sends a player only their own hand', () => {
      const result = toClientGameState(state, USER_2, TABLE);

      expect(result.hand).toEqual(USER_2_DEALT.hand);
      for (const player of result.players) {
        expect(player).not.toHaveProperty('hand');
      }
    });

    test("never sends anyone's face-down cards", () => {
      const result = toClientGameState(state, USER_1, TABLE);
      const faceDownCards = state.players.flatMap((player) =>
        player.tableCards.flatMap((slot) =>
          slot.faceDownCard ? [slot.faceDownCard] : [],
        ),
      );

      for (const faceDownCard of faceDownCards) {
        expect(JSON.stringify(result)).not.toContain(
          JSON.stringify(faceDownCard),
        );
      }
    });

    test('shows only the discard cards needed to see what to beat', () => {
      const result = toClientGameState(state, USER_1, TABLE);

      expect(result.visibleDiscardCards).toEqual(DISCARD_PILE.slice(0, 2));
    });

    test('tells players how many cards are left in the deck', () => {
      const result = toClientGameState(state, USER_1, TABLE);

      expect(result.deckSize).toBe(31);
    });

    test('rejects someone who is not in the game', () => {
      expect(() =>
        toClientGameState(state, 'other-user' as UserId, TABLE),
      ).toThrow('Player not in game');
    });
  });

  describe('swapping', () => {
    test("sends every player's face-up cards", () => {
      const result = toClientGameState(swappingState, USER_2, TABLE);

      expect(result.players[0]?.tableCards).toEqual(
        USER_1_DEALT.tableCards.map(({ faceUpCard }) => ({
          faceUpCard,
          hasFaceDownCard: true,
        })),
      );
    });

    test('tells players who has confirmed their swaps', () => {
      const result = toClientGameState(swappingState, USER_1, TABLE);

      expect(result.players.map((player) => player.isSwapConfirmed)).toEqual([
        false,
        true,
      ]);
    });

    test('tells everyone how many cards each player holds', () => {
      const result = toClientGameState(swappingState, USER_1, TABLE);

      expect(result.players.map((player) => player.cardCount)).toEqual([3, 3]);
    });

    test('marks which player is the user', () => {
      const result = toClientGameState(swappingState, USER_1, TABLE);

      expect(result.players.map((player) => player.isUser)).toEqual([
        true,
        false,
      ]);
    });
  });

  describe('in progress', () => {
    test('shows a played face-up card as just its face-down card', () => {
      const result = toClientGameState(inProgressState, USER_2, TABLE);

      expect(result.players[0]?.tableCards[0]).toEqual({
        faceUpCard: null,
        hasFaceDownCard: true,
      });
    });

    test('says whose turn it is', () => {
      const result = toClientGameState(inProgressState, USER_1, TABLE);

      expect(result).toMatchObject({
        gameStage: GameStage.IN_PROGRESS,
        currentPlayerId: USER_2,
      });
    });
  });

  describe('finished', () => {
    test('shows a finished player with no table cards left', () => {
      const result = toClientGameState(finishedState, USER_2, TABLE);

      expect(result.players[0]?.tableCards).toEqual(
        Array.from({ length: 3 }, () => ({
          faceUpCard: null,
          hasFaceDownCard: false,
        })),
      );
    });

    test('sends the finishing order', () => {
      const result = toClientGameState(finishedState, USER_1, TABLE);

      expect(result).toMatchObject({ finishingOrder: [USER_1, USER_2] });
    });
  });
});
