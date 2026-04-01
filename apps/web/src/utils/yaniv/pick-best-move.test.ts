import { describe, expect, test } from 'vitest';
import { JOKER_RANK, JokerSuit, Rank, Suit } from '~/types/cards';
import { pickBestMove } from './pick-best-move';

const neutralDiscard = { suit: Suit.CLUBS, rank: Rank.ACE };

describe('pickBestMove', () => {
  describe('matching discard rank', () => {
    test('plays all cards matching the discard rank', () => {
      const hand = [
        { suit: Suit.HEARTS, rank: Rank.SEVEN },
        { suit: Suit.SPADES, rank: Rank.SEVEN },
        { suit: Suit.CLUBS, rank: Rank.KING },
      ];
      const discard = { suit: Suit.DIAMONDS, rank: Rank.SEVEN };
      expect(pickBestMove(hand, discard)).toEqual([
        { suit: Suit.HEARTS, rank: Rank.SEVEN },
        { suit: Suit.SPADES, rank: Rank.SEVEN },
      ]);
    });

    test('plays a single card matching the discard rank', () => {
      const hand = [
        { suit: Suit.HEARTS, rank: Rank.FIVE },
        { suit: Suit.CLUBS, rank: Rank.KING },
      ];
      const discard = { suit: Suit.DIAMONDS, rank: Rank.FIVE };
      expect(pickBestMove(hand, discard)).toEqual([
        { suit: Suit.HEARTS, rank: Rank.FIVE },
      ]);
    });

    test('plays jokers when discard is also a joker', () => {
      const hand = [
        { suit: JokerSuit.RED, rank: JOKER_RANK },
        { suit: Suit.CLUBS, rank: Rank.KING },
      ];
      const discard = { suit: JokerSuit.BLACK, rank: JOKER_RANK };
      expect(pickBestMove(hand, discard)).toEqual([
        { suit: JokerSuit.RED, rank: JOKER_RANK },
      ]);
    });
  });

  describe('multiple same-rank cards', () => {
    test('plays a pair when no match with discard', () => {
      const hand = [
        { suit: Suit.HEARTS, rank: Rank.NINE },
        { suit: Suit.SPADES, rank: Rank.NINE },
        { suit: Suit.CLUBS, rank: Rank.TWO },
      ];
      expect(pickBestMove(hand, neutralDiscard)).toEqual([
        { suit: Suit.HEARTS, rank: Rank.NINE },
        { suit: Suit.SPADES, rank: Rank.NINE },
      ]);
    });

    test('plays the largest group when multiple groups exist', () => {
      const hand = [
        { suit: Suit.HEARTS, rank: Rank.THREE },
        { suit: Suit.SPADES, rank: Rank.THREE },
        { suit: Suit.CLUBS, rank: Rank.THREE },
        { suit: Suit.HEARTS, rank: Rank.KING },
        { suit: Suit.SPADES, rank: Rank.KING },
      ];
      const result = pickBestMove(hand, neutralDiscard);
      expect(result).toHaveLength(3);
      expect(result.every((c) => c.rank === Rank.THREE)).toBe(true);
    });

    test('breaks ties between equal-size groups by highest score', () => {
      const hand = [
        { suit: Suit.HEARTS, rank: Rank.TWO },
        { suit: Suit.SPADES, rank: Rank.TWO },
        { suit: Suit.HEARTS, rank: Rank.KING },
        { suit: Suit.SPADES, rank: Rank.KING },
      ];
      const result = pickBestMove(hand, neutralDiscard);
      expect(result).toHaveLength(2);
      expect(result.every((c) => c.rank === Rank.KING)).toBe(true);
    });
  });

  describe('single highest card fallback', () => {
    test('plays the highest-value card when no matches or groups', () => {
      const hand = [
        { suit: Suit.HEARTS, rank: Rank.TWO },
        { suit: Suit.SPADES, rank: Rank.QUEEN },
        { suit: Suit.CLUBS, rank: Rank.FIVE },
      ];
      expect(pickBestMove(hand, neutralDiscard)).toEqual([
        { suit: Suit.SPADES, rank: Rank.QUEEN },
      ]);
    });

    test('plays a king (10 points) over a five (5 points)', () => {
      const hand = [
        { suit: Suit.HEARTS, rank: Rank.FIVE },
        { suit: Suit.CLUBS, rank: Rank.KING },
      ];
      expect(pickBestMove(hand, neutralDiscard)).toEqual([
        { suit: Suit.CLUBS, rank: Rank.KING },
      ]);
    });

    test('joker (0 points) is not played as highest when higher cards exist', () => {
      const hand = [
        { suit: JokerSuit.RED, rank: JOKER_RANK },
        { suit: Suit.CLUBS, rank: Rank.THREE },
      ];
      expect(pickBestMove(hand, neutralDiscard)).toEqual([
        { suit: Suit.CLUBS, rank: Rank.THREE },
      ]);
    });
  });
});
