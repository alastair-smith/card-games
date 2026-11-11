import { describe, expect, test } from 'vitest';
import { Rank, type StandardPlayingCard, Suit } from '~/types/cards';
import { getVisibleDiscardCards } from './get-visible-discard-cards';

const card = (rank: Rank, suit = Suit.HEARTS): StandardPlayingCard => ({
  suit,
  rank,
});

describe('getVisibleDiscardCards', () => {
  test('shows nothing for an empty pile', () => {
    expect(getVisibleDiscardCards([])).toEqual([]);
  });

  test('shows only the top card when the card below is a different rank', () => {
    const pile = [card(Rank.KING), card(Rank.EIGHT), card(Rank.TWO)];

    expect(getVisibleDiscardCards(pile)).toEqual([card(Rank.KING)]);
  });

  describe('5s', () => {
    test('shows the card under a 5', () => {
      const pile = [card(Rank.FIVE), card(Rank.NINE), card(Rank.TWO)];

      expect(getVisibleDiscardCards(pile)).toEqual([
        card(Rank.FIVE),
        card(Rank.NINE),
      ]);
    });

    test('shows the card under several 5s', () => {
      const pile = [
        card(Rank.FIVE, Suit.HEARTS),
        card(Rank.FIVE, Suit.CLUBS),
        card(Rank.NINE),
        card(Rank.TWO),
      ];

      expect(getVisibleDiscardCards(pile)).toEqual(pile.slice(0, 3));
    });

    test('shows the whole pile when it is only 5s', () => {
      const pile = [card(Rank.FIVE, Suit.HEARTS), card(Rank.FIVE, Suit.CLUBS)];

      expect(getVisibleDiscardCards(pile)).toEqual(pile);
    });

    test('hides a 5 below the cards that set what to beat', () => {
      const pile = [card(Rank.KING), card(Rank.FIVE), card(Rank.EIGHT)];

      expect(getVisibleDiscardCards(pile)).toEqual([card(Rank.KING)]);
    });
  });

  describe('runs of the same rank', () => {
    test('shows every card in a run on top of the pile', () => {
      const pile = [
        card(Rank.KING, Suit.HEARTS),
        card(Rank.KING, Suit.CLUBS),
        card(Rank.KING, Suit.SPADES),
        card(Rank.EIGHT),
      ];

      expect(getVisibleDiscardCards(pile)).toEqual(pile.slice(0, 3));
    });

    test('shows the whole run with 5s inside it', () => {
      const pile = [
        card(Rank.FIVE, Suit.HEARTS),
        card(Rank.FIVE, Suit.CLUBS),
        card(Rank.JACK, Suit.HEARTS),
        card(Rank.FIVE, Suit.SPADES),
        card(Rank.JACK, Suit.CLUBS),
        card(Rank.FIVE, Suit.DIAMONDS),
        card(Rank.JACK, Suit.SPADES),
        card(Rank.EIGHT),
      ];

      expect(getVisibleDiscardCards(pile)).toEqual(pile.slice(0, 7));
    });
  });
});
