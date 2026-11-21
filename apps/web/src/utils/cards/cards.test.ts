import { describe, expect, test } from 'vitest';
import {
  JOKER_RANK,
  JokerSuit,
  Rank,
  Suit,
  standardDeck,
  ZERO_RANK,
} from '~/types/cards';
import { isPictureCard, isSameCard, shuffle } from '.';

describe('isSameCard', () => {
  test('matches a card with the same suit and rank', () => {
    expect(
      isSameCard(
        { suit: Suit.CLUBS, rank: Rank.TEN },
        { suit: Suit.CLUBS, rank: Rank.TEN },
      ),
    ).toBe(true);
  });

  test('tells apart cards of the same rank in different suits', () => {
    expect(
      isSameCard(
        { suit: Suit.CLUBS, rank: Rank.TEN },
        { suit: Suit.HEARTS, rank: Rank.TEN },
      ),
    ).toBe(false);
  });

  test('matches nothing when there is no card', () => {
    expect(isSameCard(null, { suit: Suit.CLUBS, rank: Rank.TEN })).toBe(false);
  });
});

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
