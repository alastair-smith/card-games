import { describe, expect, test } from 'vitest';
import { Rank, Suit } from '~/types/cards';
import { pickWorstMove } from './pick-worst-move';

const neutralDiscard = { suit: Suit.CLUBS, rank: Rank.ACE };

describe('pickWorstMove', () => {
  describe('avoiding the discard rank', () => {
    test('plays the lowest card that does not match the discard rank', () => {
      const hand = [
        { suit: Suit.HEARTS, rank: Rank.SEVEN },
        { suit: Suit.SPADES, rank: Rank.THREE },
        { suit: Suit.CLUBS, rank: Rank.KING },
      ];
      const discard = { suit: Suit.DIAMONDS, rank: Rank.THREE };
      expect(pickWorstMove(hand, discard)).toEqual([
        { suit: Suit.HEARTS, rank: Rank.SEVEN },
      ]);
    });

    test('skips all cards matching the discard rank', () => {
      const hand = [
        { suit: Suit.HEARTS, rank: Rank.FIVE },
        { suit: Suit.SPADES, rank: Rank.FIVE },
        { suit: Suit.CLUBS, rank: Rank.KING },
      ];
      const discard = { suit: Suit.DIAMONDS, rank: Rank.FIVE };
      expect(pickWorstMove(hand, discard)).toEqual([
        { suit: Suit.CLUBS, rank: Rank.KING },
      ]);
    });
  });

  describe('all cards match the discard rank', () => {
    test('falls back to the lowest card when all match the discard rank', () => {
      const hand = [
        { suit: Suit.HEARTS, rank: Rank.SEVEN },
        { suit: Suit.SPADES, rank: Rank.SEVEN },
        { suit: Suit.DIAMONDS, rank: Rank.SEVEN },
      ];
      const discard = { suit: Suit.CLUBS, rank: Rank.SEVEN };
      expect(pickWorstMove(hand, discard)).toEqual([
        { suit: Suit.HEARTS, rank: Rank.SEVEN },
      ]);
    });
  });

  describe('single lowest card fallback', () => {
    test('plays the lowest-value card when no cards match the discard', () => {
      const hand = [
        { suit: Suit.HEARTS, rank: Rank.QUEEN },
        { suit: Suit.SPADES, rank: Rank.TWO },
        { suit: Suit.CLUBS, rank: Rank.FIVE },
      ];
      expect(pickWorstMove(hand, neutralDiscard)).toEqual([
        { suit: Suit.SPADES, rank: Rank.TWO },
      ]);
    });

    test('plays an ace (1 point) over a two (2 points)', () => {
      const hand = [
        { suit: Suit.HEARTS, rank: Rank.TWO },
        { suit: Suit.SPADES, rank: Rank.ACE },
      ];
      const discard = { suit: Suit.CLUBS, rank: Rank.KING };
      expect(pickWorstMove(hand, discard)).toEqual([
        { suit: Suit.SPADES, rank: Rank.ACE },
      ]);
    });

    test('always plays a single card', () => {
      const hand = [
        { suit: Suit.HEARTS, rank: Rank.NINE },
        { suit: Suit.SPADES, rank: Rank.NINE },
        { suit: Suit.CLUBS, rank: Rank.KING },
      ];
      const result = pickWorstMove(hand, neutralDiscard);
      expect(result).toHaveLength(1);
    });
  });
});
