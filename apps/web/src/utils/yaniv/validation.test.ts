import { describe, expect, test } from 'vitest';
import { JOKER_RANK, JokerSuit, Rank, Suit } from '~/types/cards';
import { isValidYanivPlay } from './validation';

describe('isValidYanivPlay', () => {
  test('rejects empty array', () => {
    expect(isValidYanivPlay([])).toBe(false);
  });

  describe('single card', () => {
    test('accepts single number card', () => {
      expect(isValidYanivPlay([{ suit: Suit.SPADES, rank: Rank.FIVE }])).toBe(
        true,
      );
    });

    test('accepts single picture card', () => {
      expect(isValidYanivPlay([{ suit: Suit.HEARTS, rank: Rank.KING }])).toBe(
        true,
      );
    });

    test('accepts single joker', () => {
      expect(
        isValidYanivPlay([{ suit: JokerSuit.RED, rank: JOKER_RANK }]),
      ).toBe(true);
    });
  });

  describe('same rank', () => {
    test('accepts a pair', () => {
      expect(
        isValidYanivPlay([
          { suit: Suit.SPADES, rank: Rank.SEVEN },
          { suit: Suit.HEARTS, rank: Rank.SEVEN },
        ]),
      ).toBe(true);
    });

    test('accepts three of a kind', () => {
      expect(
        isValidYanivPlay([
          { suit: Suit.SPADES, rank: Rank.TEN },
          { suit: Suit.HEARTS, rank: Rank.TEN },
          { suit: Suit.CLUBS, rank: Rank.TEN },
        ]),
      ).toBe(true);
    });

    test('accepts four of a kind', () => {
      expect(
        isValidYanivPlay([
          { suit: Suit.SPADES, rank: Rank.THREE },
          { suit: Suit.HEARTS, rank: Rank.THREE },
          { suit: Suit.CLUBS, rank: Rank.THREE },
          { suit: Suit.DIAMONDS, rank: Rank.THREE },
        ]),
      ).toBe(true);
    });

    test('accepts pair with one joker substituting', () => {
      expect(
        isValidYanivPlay([
          { suit: Suit.SPADES, rank: Rank.JACK },
          { suit: JokerSuit.RED, rank: JOKER_RANK },
        ]),
      ).toBe(true);
    });

    test('accepts two jokers alone', () => {
      expect(
        isValidYanivPlay([
          { suit: JokerSuit.RED, rank: JOKER_RANK },
          { suit: JokerSuit.BLACK, rank: JOKER_RANK },
        ]),
      ).toBe(true);
    });
  });

  describe('runs', () => {
    test('accepts valid run of 3', () => {
      expect(
        isValidYanivPlay([
          { suit: Suit.HEARTS, rank: Rank.FOUR },
          { suit: Suit.HEARTS, rank: Rank.FIVE },
          { suit: Suit.HEARTS, rank: Rank.SIX },
        ]),
      ).toBe(true);
    });

    test('accepts valid run of 4', () => {
      expect(
        isValidYanivPlay([
          { suit: Suit.CLUBS, rank: Rank.EIGHT },
          { suit: Suit.CLUBS, rank: Rank.NINE },
          { suit: Suit.CLUBS, rank: Rank.TEN },
          { suit: Suit.CLUBS, rank: Rank.JACK },
        ]),
      ).toBe(true);
    });

    test('accepts valid run of 5', () => {
      expect(
        isValidYanivPlay([
          { suit: Suit.DIAMONDS, rank: Rank.TWO },
          { suit: Suit.DIAMONDS, rank: Rank.THREE },
          { suit: Suit.DIAMONDS, rank: Rank.FOUR },
          { suit: Suit.DIAMONDS, rank: Rank.FIVE },
          { suit: Suit.DIAMONDS, rank: Rank.SIX },
        ]),
      ).toBe(true);
    });

    test('accepts valid run of 7', () => {
      expect(
        isValidYanivPlay([
          { suit: Suit.SPADES, rank: Rank.FIVE },
          { suit: Suit.SPADES, rank: Rank.SIX },
          { suit: Suit.SPADES, rank: Rank.SEVEN },
          { suit: Suit.SPADES, rank: Rank.EIGHT },
          { suit: Suit.SPADES, rank: Rank.NINE },
          { suit: Suit.SPADES, rank: Rank.TEN },
          { suit: Suit.SPADES, rank: Rank.JACK },
        ]),
      ).toBe(true);
    });

    test('accepts run with joker filling an internal gap', () => {
      expect(
        isValidYanivPlay([
          { suit: Suit.SPADES, rank: Rank.THREE },
          { suit: JokerSuit.RED, rank: JOKER_RANK },
          { suit: Suit.SPADES, rank: Rank.FIVE },
        ]),
      ).toBe(true);
    });

    test('accepts run with joker extending an end', () => {
      expect(
        isValidYanivPlay([
          { suit: Suit.HEARTS, rank: Rank.SIX },
          { suit: Suit.HEARTS, rank: Rank.SEVEN },
          { suit: JokerSuit.RED, rank: JOKER_RANK },
        ]),
      ).toBe(true);
    });

    test('rejects mixed suits', () => {
      expect(
        isValidYanivPlay([
          { suit: Suit.SPADES, rank: Rank.FOUR },
          { suit: Suit.HEARTS, rank: Rank.FIVE },
          { suit: Suit.SPADES, rank: Rank.SIX },
        ]),
      ).toBe(false);
    });

    test('rejects wrap-around runs through Ace', () => {
      expect(
        isValidYanivPlay([
          { suit: Suit.HEARTS, rank: Rank.QUEEN },
          { suit: Suit.HEARTS, rank: Rank.KING },
          { suit: Suit.HEARTS, rank: Rank.ACE },
          { suit: Suit.HEARTS, rank: Rank.TWO },
        ]),
      ).toBe(false);
    });

    test('rejects when jokers cannot fill the gap', () => {
      expect(
        isValidYanivPlay([
          { suit: Suit.CLUBS, rank: Rank.TWO },
          { suit: JokerSuit.RED, rank: JOKER_RANK },
          { suit: JokerSuit.BLACK, rank: JOKER_RANK },
          { suit: Suit.CLUBS, rank: Rank.SEVEN },
        ]),
      ).toBe(false);
    });
  });

  describe('invalid combinations', () => {
    test('rejects non-matching ranks with no run', () => {
      expect(
        isValidYanivPlay([
          { suit: Suit.SPADES, rank: Rank.TWO },
          { suit: Suit.SPADES, rank: Rank.NINE },
        ]),
      ).toBe(false);
    });
  });
});
