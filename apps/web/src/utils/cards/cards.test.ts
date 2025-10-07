import { describe, expect, test } from 'vitest';
import { standardDeck } from '~/types/cards';
import { shuffle } from '.';

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
