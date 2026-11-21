import { describe, expect, test } from 'vitest';
import { Rank, type StandardPlayingCard, Suit } from '~/types/cards';
import { groupByRank, sortShitheadHand } from './sort';

const ACE_OF_CLUBS = { suit: Suit.CLUBS, rank: Rank.ACE };
const TWO_OF_SPADES = { suit: Suit.SPADES, rank: Rank.TWO };
const SEVEN_OF_HEARTS = { suit: Suit.HEARTS, rank: Rank.SEVEN };
const SEVEN_OF_CLUBS = { suit: Suit.CLUBS, rank: Rank.SEVEN };
const KING_OF_DIAMONDS = { suit: Suit.DIAMONDS, rank: Rank.KING };

describe('sortShitheadHand', () => {
  test('sorts from 2 up to Ace', () => {
    expect(
      sortShitheadHand([ACE_OF_CLUBS, KING_OF_DIAMONDS, TWO_OF_SPADES]),
    ).toEqual([TWO_OF_SPADES, KING_OF_DIAMONDS, ACE_OF_CLUBS]);
  });

  test('sorts cards of the same rank by suit', () => {
    expect(sortShitheadHand([SEVEN_OF_HEARTS, SEVEN_OF_CLUBS])).toEqual([
      SEVEN_OF_CLUBS,
      SEVEN_OF_HEARTS,
    ]);
  });

  test('leaves the cards passed in unchanged', () => {
    const cards: StandardPlayingCard[] = [ACE_OF_CLUBS, TWO_OF_SPADES];

    sortShitheadHand(cards);

    expect(cards).toEqual([ACE_OF_CLUBS, TWO_OF_SPADES]);
  });
});

describe('groupByRank', () => {
  test('puts cards of the same rank in one group', () => {
    expect(
      groupByRank([TWO_OF_SPADES, SEVEN_OF_CLUBS, SEVEN_OF_HEARTS]),
    ).toEqual([
      { rank: Rank.TWO, cards: [TWO_OF_SPADES] },
      { rank: Rank.SEVEN, cards: [SEVEN_OF_CLUBS, SEVEN_OF_HEARTS] },
    ]);
  });

  test('has no groups for no cards', () => {
    expect(groupByRank([])).toEqual([]);
  });
});
