import { describe, expect, test } from 'vitest';
import { JOKER_RANK, JokerSuit, Rank, Suit } from '~/types/cards';
import { isValidYanivPlay } from './validation';

// A standard card that won't trigger either discard-aware check for any of the
// standalone test hands: rank ACE (1) is low enough that no run in the test
// suite bridges the gap from ACE♣ to the played cards, and no test hand
// consists entirely of aces.
const neutralDiscard = { suit: Suit.CLUBS, rank: Rank.ACE };

describe('isValidYanivPlay', () => {
  test('rejects empty array', () => {
    expect(isValidYanivPlay([], neutralDiscard)).toEqual({
      isValid: false,
      isPickupRequired: false,
    });
  });

  describe('single card', () => {
    test('accepts single number card', () => {
      expect(
        isValidYanivPlay(
          [{ suit: Suit.SPADES, rank: Rank.FIVE }],
          neutralDiscard,
        ),
      ).toEqual({ isValid: true, isPickupRequired: true });
    });

    test('accepts single picture card', () => {
      expect(
        isValidYanivPlay(
          [{ suit: Suit.HEARTS, rank: Rank.KING }],
          neutralDiscard,
        ),
      ).toEqual({ isValid: true, isPickupRequired: true });
    });

    test('accepts single joker', () => {
      expect(
        isValidYanivPlay(
          [{ suit: JokerSuit.RED, rank: JOKER_RANK }],
          neutralDiscard,
        ),
      ).toEqual({ isValid: true, isPickupRequired: true });
    });
  });

  describe('same rank', () => {
    test('accepts a pair', () => {
      expect(
        isValidYanivPlay(
          [
            { suit: Suit.SPADES, rank: Rank.SEVEN },
            { suit: Suit.HEARTS, rank: Rank.SEVEN },
          ],
          neutralDiscard,
        ),
      ).toEqual({ isValid: true, isPickupRequired: true });
    });

    test('accepts three of a kind', () => {
      expect(
        isValidYanivPlay(
          [
            { suit: Suit.SPADES, rank: Rank.TEN },
            { suit: Suit.HEARTS, rank: Rank.TEN },
            { suit: Suit.CLUBS, rank: Rank.TEN },
          ],
          neutralDiscard,
        ),
      ).toEqual({ isValid: true, isPickupRequired: true });
    });

    test('accepts four of a kind', () => {
      expect(
        isValidYanivPlay(
          [
            { suit: Suit.SPADES, rank: Rank.THREE },
            { suit: Suit.HEARTS, rank: Rank.THREE },
            { suit: Suit.CLUBS, rank: Rank.THREE },
            { suit: Suit.DIAMONDS, rank: Rank.THREE },
          ],
          neutralDiscard,
        ),
      ).toEqual({ isValid: true, isPickupRequired: true });
    });

    test('accepts pair with one joker substituting', () => {
      expect(
        isValidYanivPlay(
          [
            { suit: Suit.SPADES, rank: Rank.JACK },
            { suit: JokerSuit.RED, rank: JOKER_RANK },
          ],
          neutralDiscard,
        ),
      ).toEqual({ isValid: true, isPickupRequired: true });
    });

    test('accepts two jokers alone', () => {
      expect(
        isValidYanivPlay(
          [
            { suit: JokerSuit.RED, rank: JOKER_RANK },
            { suit: JokerSuit.BLACK, rank: JOKER_RANK },
          ],
          neutralDiscard,
        ),
      ).toEqual({ isValid: true, isPickupRequired: true });
    });
  });

  describe('runs', () => {
    test('accepts valid run of 3', () => {
      expect(
        isValidYanivPlay(
          [
            { suit: Suit.HEARTS, rank: Rank.FOUR },
            { suit: Suit.HEARTS, rank: Rank.FIVE },
            { suit: Suit.HEARTS, rank: Rank.SIX },
          ],
          neutralDiscard,
        ),
      ).toEqual({ isValid: true, isPickupRequired: true });
    });

    test('accepts valid run of 4', () => {
      expect(
        isValidYanivPlay(
          [
            { suit: Suit.CLUBS, rank: Rank.EIGHT },
            { suit: Suit.CLUBS, rank: Rank.NINE },
            { suit: Suit.CLUBS, rank: Rank.TEN },
            { suit: Suit.CLUBS, rank: Rank.JACK },
          ],
          neutralDiscard,
        ),
      ).toEqual({ isValid: true, isPickupRequired: true });
    });

    test('accepts valid run of 5', () => {
      expect(
        isValidYanivPlay(
          [
            { suit: Suit.DIAMONDS, rank: Rank.TWO },
            { suit: Suit.DIAMONDS, rank: Rank.THREE },
            { suit: Suit.DIAMONDS, rank: Rank.FOUR },
            { suit: Suit.DIAMONDS, rank: Rank.FIVE },
            { suit: Suit.DIAMONDS, rank: Rank.SIX },
          ],
          neutralDiscard,
        ),
      ).toEqual({ isValid: true, isPickupRequired: true });
    });

    test('accepts valid run of 7', () => {
      expect(
        isValidYanivPlay(
          [
            { suit: Suit.SPADES, rank: Rank.FIVE },
            { suit: Suit.SPADES, rank: Rank.SIX },
            { suit: Suit.SPADES, rank: Rank.SEVEN },
            { suit: Suit.SPADES, rank: Rank.EIGHT },
            { suit: Suit.SPADES, rank: Rank.NINE },
            { suit: Suit.SPADES, rank: Rank.TEN },
            { suit: Suit.SPADES, rank: Rank.JACK },
          ],
          neutralDiscard,
        ),
      ).toEqual({ isValid: true, isPickupRequired: true });
    });

    test('accepts run with joker filling an internal gap', () => {
      expect(
        isValidYanivPlay(
          [
            { suit: Suit.SPADES, rank: Rank.THREE },
            { suit: JokerSuit.RED, rank: JOKER_RANK },
            { suit: Suit.SPADES, rank: Rank.FIVE },
          ],
          neutralDiscard,
        ),
      ).toEqual({ isValid: true, isPickupRequired: true });
    });

    test('accepts run with joker extending an end', () => {
      expect(
        isValidYanivPlay(
          [
            { suit: Suit.HEARTS, rank: Rank.SIX },
            { suit: Suit.HEARTS, rank: Rank.SEVEN },
            { suit: JokerSuit.RED, rank: JOKER_RANK },
          ],
          neutralDiscard,
        ),
      ).toEqual({ isValid: true, isPickupRequired: true });
    });

    test('rejects a run of only 2 cards', () => {
      expect(
        isValidYanivPlay(
          [
            { suit: Suit.CLUBS, rank: Rank.FOUR },
            { suit: Suit.CLUBS, rank: Rank.FIVE },
          ],
          neutralDiscard,
        ),
      ).toEqual({ isValid: false, isPickupRequired: false });
    });

    test('rejects mixed suits', () => {
      expect(
        isValidYanivPlay(
          [
            { suit: Suit.SPADES, rank: Rank.FOUR },
            { suit: Suit.HEARTS, rank: Rank.FIVE },
            { suit: Suit.SPADES, rank: Rank.SIX },
          ],
          neutralDiscard,
        ),
      ).toEqual({ isValid: false, isPickupRequired: false });
    });

    test('rejects wrap-around runs through Ace', () => {
      expect(
        isValidYanivPlay(
          [
            { suit: Suit.HEARTS, rank: Rank.QUEEN },
            { suit: Suit.HEARTS, rank: Rank.KING },
            { suit: Suit.HEARTS, rank: Rank.ACE },
            { suit: Suit.HEARTS, rank: Rank.TWO },
          ],
          neutralDiscard,
        ),
      ).toEqual({ isValid: false, isPickupRequired: false });
    });

    test('rejects when jokers cannot fill the gap', () => {
      expect(
        isValidYanivPlay(
          [
            { suit: Suit.CLUBS, rank: Rank.TWO },
            { suit: JokerSuit.RED, rank: JOKER_RANK },
            { suit: JokerSuit.BLACK, rank: JOKER_RANK },
            { suit: Suit.CLUBS, rank: Rank.SEVEN },
          ],
          neutralDiscard,
        ),
      ).toEqual({ isValid: false, isPickupRequired: false });
    });
  });

  describe('invalid combinations', () => {
    test('rejects non-matching ranks with no run', () => {
      expect(
        isValidYanivPlay(
          [
            { suit: Suit.SPADES, rank: Rank.TWO },
            { suit: Suit.SPADES, rank: Rank.NINE },
          ],
          neutralDiscard,
        ),
      ).toEqual({ isValid: false, isPickupRequired: false });
    });
  });

  describe('matching-rank plays on top of discard (no pickup)', () => {
    const topDiscard = { suit: Suit.HEARTS, rank: Rank.SEVEN };

    test('single card matching top discard rank requires no pickup', () => {
      expect(
        isValidYanivPlay([{ suit: Suit.SPADES, rank: Rank.SEVEN }], topDiscard),
      ).toEqual({ isValid: true, isPickupRequired: false });
    });

    test('two cards matching top discard rank require no pickup', () => {
      expect(
        isValidYanivPlay(
          [
            { suit: Suit.SPADES, rank: Rank.SEVEN },
            { suit: Suit.CLUBS, rank: Rank.SEVEN },
          ],
          topDiscard,
        ),
      ).toEqual({ isValid: true, isPickupRequired: false });
    });

    test('three cards matching top discard rank require no pickup', () => {
      expect(
        isValidYanivPlay(
          [
            { suit: Suit.SPADES, rank: Rank.SEVEN },
            { suit: Suit.CLUBS, rank: Rank.SEVEN },
            { suit: Suit.DIAMONDS, rank: Rank.SEVEN },
          ],
          topDiscard,
        ),
      ).toEqual({ isValid: true, isPickupRequired: false });
    });

    test('card with different rank falls through to standalone validation', () => {
      expect(
        isValidYanivPlay([{ suit: Suit.SPADES, rank: Rank.FIVE }], topDiscard),
      ).toEqual({ isValid: true, isPickupRequired: true });
    });

    test('joker in played cards does not trigger matching-rank rule', () => {
      expect(
        isValidYanivPlay(
          [{ suit: JokerSuit.RED, rank: JOKER_RANK }],
          topDiscard,
        ),
      ).toEqual({ isValid: true, isPickupRequired: true });
    });

    test('standard card played on joker top discard does not trigger matching-rank rule', () => {
      expect(
        isValidYanivPlay([{ suit: Suit.SPADES, rank: Rank.SEVEN }], {
          suit: JokerSuit.RED,
          rank: JOKER_RANK,
        }),
      ).toEqual({ isValid: true, isPickupRequired: true });
    });

    test('joker played on joker top discard requires no pickup', () => {
      expect(
        isValidYanivPlay([{ suit: JokerSuit.RED, rank: JOKER_RANK }], {
          suit: JokerSuit.BLACK,
          rank: JOKER_RANK,
        }),
      ).toEqual({ isValid: true, isPickupRequired: false });
    });
  });

  describe('run extension plays on top of discard (pickup required)', () => {
    test('two cards extending a run above the top discard', () => {
      expect(
        isValidYanivPlay(
          [
            { suit: Suit.HEARTS, rank: Rank.SIX },
            { suit: Suit.HEARTS, rank: Rank.SEVEN },
          ],
          { suit: Suit.HEARTS, rank: Rank.FIVE },
        ),
      ).toEqual({ isValid: true, isPickupRequired: true });
    });

    test('two cards extending a run below the top discard', () => {
      expect(
        isValidYanivPlay(
          [
            { suit: Suit.HEARTS, rank: Rank.THREE },
            { suit: Suit.HEARTS, rank: Rank.FOUR },
          ],
          { suit: Suit.HEARTS, rank: Rank.FIVE },
        ),
      ).toEqual({ isValid: true, isPickupRequired: true });
    });

    test('two cards extending a run with top discard in the middle', () => {
      expect(
        isValidYanivPlay(
          [
            { suit: Suit.HEARTS, rank: Rank.FOUR },
            { suit: Suit.HEARTS, rank: Rank.SIX },
          ],
          { suit: Suit.HEARTS, rank: Rank.FIVE },
        ),
      ).toEqual({ isValid: true, isPickupRequired: true });
    });

    test('mixed suits are rejected as a run extension', () => {
      expect(
        isValidYanivPlay(
          [
            { suit: Suit.HEARTS, rank: Rank.SIX },
            { suit: Suit.SPADES, rank: Rank.SEVEN },
          ],
          { suit: Suit.HEARTS, rank: Rank.FIVE },
        ),
      ).toEqual({ isValid: false, isPickupRequired: false });
    });

    test('single card does not qualify as a run extension', () => {
      // Falls through to standalone single-card validation — still valid but pickup is required
      expect(
        isValidYanivPlay([{ suit: Suit.HEARTS, rank: Rank.SIX }], {
          suit: Suit.HEARTS,
          rank: Rank.FIVE,
        }),
      ).toEqual({ isValid: true, isPickupRequired: true });
    });

    test('joker as top discard does not trigger run extension rule', () => {
      // [6♥, 6♠] is a valid standalone pair — pickup is still required because the
      // run extension path never fires when topDiscard is a joker.
      expect(
        isValidYanivPlay(
          [
            { suit: Suit.HEARTS, rank: Rank.SIX },
            { suit: Suit.SPADES, rank: Rank.SIX },
          ],
          { suit: JokerSuit.RED, rank: JOKER_RANK },
        ),
      ).toEqual({ isValid: true, isPickupRequired: true });
    });
  });
});
