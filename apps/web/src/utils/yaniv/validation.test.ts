import { describe, expect, test } from 'vitest';
import { JOKER_RANK, JokerSuit, Rank, Suit } from '~/types/cards';
import { isValidYanivPlay } from './validation';

const joker = (suit: JokerSuit = JokerSuit.RED) => ({
  suit,
  rank: JOKER_RANK,
});
const card = (suit: Suit, rank: Rank) => ({ suit, rank });

describe('isValidYanivPlay', () => {
  test('rejects empty array', () => {
    expect(isValidYanivPlay([])).toBe(false);
  });

  test('accepts single number card', () => {
    expect(isValidYanivPlay([card(Suit.SPADES, Rank.FIVE)])).toBe(true);
  });

  test('accepts single picture card', () => {
    expect(isValidYanivPlay([card(Suit.HEARTS, Rank.KING)])).toBe(true);
  });

  test('accepts single joker', () => {
    expect(isValidYanivPlay([joker()])).toBe(true);
  });

  test('accepts a pair', () => {
    expect(
      isValidYanivPlay([
        card(Suit.SPADES, Rank.SEVEN),
        card(Suit.HEARTS, Rank.SEVEN),
      ]),
    ).toBe(true);
  });

  test('accepts three of a kind', () => {
    expect(
      isValidYanivPlay([
        card(Suit.SPADES, Rank.TEN),
        card(Suit.HEARTS, Rank.TEN),
        card(Suit.CLUBS, Rank.TEN),
      ]),
    ).toBe(true);
  });

  test('accepts four of a kind', () => {
    expect(
      isValidYanivPlay([
        card(Suit.SPADES, Rank.THREE),
        card(Suit.HEARTS, Rank.THREE),
        card(Suit.CLUBS, Rank.THREE),
        card(Suit.DIAMONDS, Rank.THREE),
      ]),
    ).toBe(true);
  });

  test('accepts pair with one joker substituting', () => {
    expect(isValidYanivPlay([card(Suit.SPADES, Rank.JACK), joker()])).toBe(
      true,
    );
  });

  test('accepts valid run of 3', () => {
    expect(
      isValidYanivPlay([
        card(Suit.HEARTS, Rank.FOUR),
        card(Suit.HEARTS, Rank.FIVE),
        card(Suit.HEARTS, Rank.SIX),
      ]),
    ).toBe(true);
  });

  test('accepts valid run of 4', () => {
    expect(
      isValidYanivPlay([
        card(Suit.CLUBS, Rank.EIGHT),
        card(Suit.CLUBS, Rank.NINE),
        card(Suit.CLUBS, Rank.TEN),
        card(Suit.CLUBS, Rank.JACK),
      ]),
    ).toBe(true);
  });

  test('accepts valid run of 5', () => {
    expect(
      isValidYanivPlay([
        card(Suit.DIAMONDS, Rank.TWO),
        card(Suit.DIAMONDS, Rank.THREE),
        card(Suit.DIAMONDS, Rank.FOUR),
        card(Suit.DIAMONDS, Rank.FIVE),
        card(Suit.DIAMONDS, Rank.SIX),
      ]),
    ).toBe(true);
  });

  test('accepts run with joker filling an internal gap', () => {
    expect(
      isValidYanivPlay([
        card(Suit.SPADES, Rank.THREE),
        joker(),
        card(Suit.SPADES, Rank.FIVE),
      ]),
    ).toBe(true);
  });

  test('accepts run with joker extending an end', () => {
    expect(
      isValidYanivPlay([
        card(Suit.HEARTS, Rank.SIX),
        card(Suit.HEARTS, Rank.SEVEN),
        joker(),
      ]),
    ).toBe(true);
  });

  test('accepts two jokers alone', () => {
    expect(
      isValidYanivPlay([joker(JokerSuit.RED), joker(JokerSuit.BLACK)]),
    ).toBe(true);
  });

  test('accepts three jokers alone', () => {
    expect(isValidYanivPlay([joker(), joker(JokerSuit.BLACK), joker()])).toBe(
      true,
    );
  });

  test('rejects non-matching ranks with no run', () => {
    expect(
      isValidYanivPlay([
        card(Suit.SPADES, Rank.TWO),
        card(Suit.SPADES, Rank.NINE),
      ]),
    ).toBe(false);
  });

  test('rejects mixed suits (invalid run)', () => {
    expect(
      isValidYanivPlay([
        card(Suit.SPADES, Rank.FOUR),
        card(Suit.HEARTS, Rank.FIVE),
        card(Suit.SPADES, Rank.SIX),
      ]),
    ).toBe(false);
  });

  test('rejects two jokers unable to fill a gap too large', () => {
    expect(
      isValidYanivPlay([
        card(Suit.CLUBS, Rank.TWO),
        joker(),
        joker(),
        card(Suit.CLUBS, Rank.SEVEN),
      ]),
    ).toBe(false);
  });
});
