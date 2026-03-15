import { describe, expect, test } from 'vitest';
import {
  JOKER_RANK,
  JokerSuit,
  Rank,
  Suit,
  standardDeck,
  ZERO_RANK,
} from '~/types/cards';
import { isPictureCard, shuffle, sortYanivHand, sumYanivHand } from '.';

describe('isPictureCard', () => {
  test('returns true for Jack', () => {
    expect(isPictureCard({ suit: Suit.SPADES, rank: Rank.JACK })).toBe(true);
  });

  test('returns true for Queen', () => {
    expect(isPictureCard({ suit: Suit.HEARTS, rank: Rank.QUEEN })).toBe(true);
  });

  test('returns true for King', () => {
    expect(isPictureCard({ suit: Suit.CLUBS, rank: Rank.KING })).toBe(true);
  });

  test('returns true for Ace', () => {
    expect(isPictureCard({ suit: Suit.DIAMONDS, rank: Rank.ACE })).toBe(true);
  });

  test('returns true for Joker', () => {
    expect(isPictureCard({ suit: JokerSuit.RED, rank: JOKER_RANK })).toBe(true);
  });

  test('returns true for Zero card', () => {
    expect(isPictureCard({ suit: Suit.SPADES, rank: ZERO_RANK })).toBe(true);
  });

  test('returns false for number cards', () => {
    const numberRanks = [
      Rank.TWO,
      Rank.THREE,
      Rank.FOUR,
      Rank.FIVE,
      Rank.SIX,
      Rank.SEVEN,
      Rank.EIGHT,
      Rank.NINE,
      Rank.TEN,
    ];
    for (const rank of numberRanks) {
      expect(isPictureCard({ suit: Suit.SPADES, rank })).toBe(false);
    }
  });
});

describe('sumYanivHand', () => {
  test('returns 0 for an empty hand', () => {
    expect(sumYanivHand([])).toBe(0);
  });

  test('sums number card face values', () => {
    const hand = [
      { suit: Suit.SPADES, rank: Rank.THREE },
      { suit: Suit.HEARTS, rank: Rank.SEVEN },
    ];
    expect(sumYanivHand(hand)).toBe(10);
  });

  test('counts Jack, Queen, and King as 10 each', () => {
    const hand = [
      { suit: Suit.SPADES, rank: Rank.JACK },
      { suit: Suit.HEARTS, rank: Rank.QUEEN },
      { suit: Suit.CLUBS, rank: Rank.KING },
    ];
    expect(sumYanivHand(hand)).toBe(30);
  });

  test('counts Ace as 1', () => {
    const hand = [{ suit: Suit.SPADES, rank: Rank.ACE }];
    expect(sumYanivHand(hand)).toBe(1);
  });

  test('counts Joker as 0', () => {
    const hand = [{ suit: JokerSuit.RED, rank: JOKER_RANK }];
    expect(sumYanivHand(hand)).toBe(0);
  });

  test('sums a mixed hand correctly', () => {
    const hand = [
      { suit: Suit.SPADES, rank: Rank.ACE },
      { suit: Suit.HEARTS, rank: Rank.FIVE },
      { suit: JokerSuit.BLACK, rank: JOKER_RANK },
      { suit: Suit.CLUBS, rank: Rank.KING },
    ];
    expect(sumYanivHand(hand)).toBe(16);
  });
});

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

describe('shuffle', () => {
  const originalDeck = [...standardDeck];

  test('standard deck is shuffled', () => {
    const shuffledDeck = shuffle(originalDeck);

    expect(shuffledDeck, 'deck should be same size').toHaveLength(
      originalDeck.length,
    );
    expect(
      originalDeck.every((card) => shuffledDeck.includes(card)),
      'every card should be present',
    ).toBe(true);
    expect(originalDeck, 'original deck should not be mutated').toEqual(
      standardDeck,
    );
    expect(
      shuffledDeck.filter((card, index) => card !== originalDeck[index]).length,
      'order should be different for a decent amount of cards',
    ).toBeGreaterThan(20);
  });
});
