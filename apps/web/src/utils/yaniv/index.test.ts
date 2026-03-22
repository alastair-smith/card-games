import { describe, expect, test } from 'vitest';
import { JOKER_RANK, JokerSuit, Rank, Suit } from '~/types/cards';
import { sumYanivHand } from '.';

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
