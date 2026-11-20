import { describe, expect, test } from 'vitest';
import { buildTableCards } from '~/test-utils/shithead';
import { getPlaySource } from './play-source';

const faceDownOnly = buildTableCards().map((slot) => ({
  ...slot,
  faceUpCard: null,
}));

const noTableCards = buildTableCards().map(() => ({
  faceUpCard: null,
  hasFaceDownCard: false,
}));

describe('getPlaySource', () => {
  test('plays from the hand while it has cards', () => {
    expect(getPlaySource({ cardCount: 2, tableCards: buildTableCards() })).toBe(
      'hand',
    );
  });

  test('plays face-up cards once the hand is empty', () => {
    expect(getPlaySource({ cardCount: 0, tableCards: buildTableCards() })).toBe(
      'faceUp',
    );
  });

  test('plays face-down cards once the face-up cards are gone', () => {
    expect(getPlaySource({ cardCount: 0, tableCards: faceDownOnly })).toBe(
      'faceDown',
    );
  });

  test('has nothing to play from once every card is gone', () => {
    expect(getPlaySource({ cardCount: 0, tableCards: noTableCards })).toBe(
      null,
    );
  });
});
