import { describe, expect, test } from 'vitest';
import { JOKER_RANK, JokerSuit, Rank, Suit } from '~/types/cards';
import { sortYanivHand } from './sort';

describe('sortYanivHand', () => {
  test('sorts highest rank first', () => {
    const hand = [
      { suit: Suit.SPADES, rank: Rank.ACE },
      { suit: Suit.HEARTS, rank: Rank.KING },
      { suit: Suit.CLUBS, rank: Rank.QUEEN },
    ];
    const sorted = sortYanivHand(hand);
    expect(sorted[0]).toEqual({ suit: Suit.HEARTS, rank: Rank.KING });
    expect(sorted[1]).toEqual({ suit: Suit.CLUBS, rank: Rank.QUEEN });
    expect(sorted[2]).toEqual({ suit: Suit.SPADES, rank: Rank.ACE });
  });

  test('treats ace as low (after two)', () => {
    const hand = [
      { suit: Suit.SPADES, rank: Rank.ACE },
      { suit: Suit.HEARTS, rank: Rank.TWO },
    ];
    const sorted = sortYanivHand(hand);
    expect(sorted[0]).toEqual({ suit: Suit.HEARTS, rank: Rank.TWO });
    expect(sorted[1]).toEqual({ suit: Suit.SPADES, rank: Rank.ACE });
  });

  test('places joker last', () => {
    const hand = [
      { suit: JokerSuit.RED, rank: JOKER_RANK },
      { suit: Suit.SPADES, rank: Rank.ACE },
    ];
    const sorted = sortYanivHand(hand);
    expect(sorted[0]).toEqual({ suit: Suit.SPADES, rank: Rank.ACE });
    expect(sorted[1]).toEqual({ suit: JokerSuit.RED, rank: JOKER_RANK });
  });

  test('sorts equal ranks by suit: spades, hearts, clubs, diamonds', () => {
    const hand = [
      { suit: Suit.DIAMONDS, rank: Rank.SEVEN },
      { suit: Suit.CLUBS, rank: Rank.SEVEN },
      { suit: Suit.HEARTS, rank: Rank.SEVEN },
      { suit: Suit.SPADES, rank: Rank.SEVEN },
    ];
    const sorted = sortYanivHand(hand);
    expect(sorted[0]?.suit).toBe(Suit.SPADES);
    expect(sorted[1]?.suit).toBe(Suit.HEARTS);
    expect(sorted[2]?.suit).toBe(Suit.CLUBS);
    expect(sorted[3]?.suit).toBe(Suit.DIAMONDS);
  });

  test('does not mutate the original array', () => {
    const hand = [
      { suit: Suit.SPADES, rank: Rank.ACE },
      { suit: Suit.HEARTS, rank: Rank.KING },
    ];
    const original = [...hand];
    sortYanivHand(hand);
    expect(hand).toEqual(original);
  });
});
