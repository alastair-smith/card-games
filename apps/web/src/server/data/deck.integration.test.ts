import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest';
import { yanivDeck } from '~/server/data/deck';
import { redis } from '~/server/data/redis';
import { Rank, Suit } from '~/types/cards';
import type { GameCode } from '~/types/game';
import type { YanivPlayingCard } from '~/types/games/yaniv';

const makeCode = () => crypto.randomUUID() as GameCode;

const aceOfSpades: YanivPlayingCard = { suit: Suit.SPADES, rank: Rank.ACE };
const twoOfHearts: YanivPlayingCard = { suit: Suit.HEARTS, rank: Rank.TWO };
const threeOfDiamonds: YanivPlayingCard = {
  suit: Suit.DIAMONDS,
  rank: Rank.THREE,
};

const testCards: YanivPlayingCard[] = [
  aceOfSpades,
  twoOfHearts,
  threeOfDiamonds,
];

const deckKey = (code: GameCode) => `deck:yaniv:${code}`;

describe('yanivDeck', () => {
  let code: GameCode;

  beforeEach(() => {
    code = makeCode();
  });

  afterEach(async () => {
    await redis.del(deckKey(code));
  });

  afterAll(async () => {
    await redis.quit();
  });

  describe('createDeck', () => {
    it('stores all cards and getDeckSize returns the count', async () => {
      await yanivDeck.createDeck(code, testCards);
      expect(await yanivDeck.getDeckSize(code)).toBe(testCards.length);
    });

    it('clears previous state when called on an existing key', async () => {
      await yanivDeck.createDeck(code, testCards);
      await yanivDeck.createDeck(code, [aceOfSpades]);
      expect(await yanivDeck.getDeckSize(code)).toBe(1);
    });
  });

  describe('drawCard', () => {
    it('draws cards in creation order (FIFO)', async () => {
      await yanivDeck.createDeck(code, testCards);
      const first = await yanivDeck.drawCard(code);
      expect(first).toEqual(aceOfSpades);
      const second = await yanivDeck.drawCard(code);
      expect(second).toEqual(twoOfHearts);
    });

    it('returns null when deck is exhausted', async () => {
      await yanivDeck.createDeck(code, [aceOfSpades]);
      await yanivDeck.drawCard(code);
      const card = await yanivDeck.drawCard(code);
      expect(card).toBeNull();
    });
  });

  describe('drawCards', () => {
    it('draws n cards sequentially in order', async () => {
      await yanivDeck.createDeck(code, testCards);
      const drawn = await yanivDeck.drawCards(code, 2);
      expect(drawn).toEqual([aceOfSpades, twoOfHearts]);
      expect(await yanivDeck.getDeckSize(code)).toBe(1);
    });
  });

  describe('deckExists', () => {
    it('returns true when cards remain', async () => {
      await yanivDeck.createDeck(code, [aceOfSpades]);
      expect(await yanivDeck.deckExists(code)).toBe(true);
    });

    it('returns false after all cards are drawn', async () => {
      await yanivDeck.createDeck(code, [aceOfSpades]);
      await yanivDeck.drawCard(code);
      expect(await yanivDeck.deckExists(code)).toBe(false);
    });
  });
});
