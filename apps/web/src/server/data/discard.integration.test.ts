import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest';
import { redis } from '~/server/data/redis';
import { yanivDiscard } from '~/server/data/discard';
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

const discardKey = (code: GameCode) => `discard:yaniv:${code}`;

describe('yanivDiscard', () => {
  let code: GameCode;

  beforeEach(() => {
    code = makeCode();
  });

  afterEach(async () => {
    await redis.del(discardKey(code));
  });

  afterAll(async () => {
    await redis.quit();
  });

  describe('createDiscard', () => {
    it('clears any pre-existing pile', async () => {
      await redis.rpush(discardKey(code), JSON.stringify(aceOfSpades));
      await yanivDiscard.createDiscard(code);
      const size = await yanivDiscard.getDiscardSize(code);
      expect(size).toBe(0);
    });
  });

  describe('pushDiscard and popDiscard', () => {
    it('returns a single pushed card and empties the pile', async () => {
      await yanivDiscard.pushDiscard(code, aceOfSpades);
      const card = await yanivDiscard.popDiscard(code);
      expect(card).toEqual(aceOfSpades);
      const size = await yanivDiscard.getDiscardSize(code);
      expect(size).toBe(0);
    });

    it('returns top card first when multiple cards are pushed (LIFO)', async () => {
      await yanivDiscard.pushDiscard(code, [
        aceOfSpades,
        twoOfHearts,
        threeOfDiamonds,
      ]);
      const first = await yanivDiscard.popDiscard(code);
      expect(first).toEqual(threeOfDiamonds);
      const second = await yanivDiscard.popDiscard(code);
      expect(second).toEqual(twoOfHearts);
    });
  });

  describe('peekDiscard', () => {
    it('returns the top card without removing it', async () => {
      await yanivDiscard.pushDiscard(code, [aceOfSpades, twoOfHearts]);
      const peeked = await yanivDiscard.peekDiscard(code);
      expect(peeked).toEqual(twoOfHearts);
      const size = await yanivDiscard.getDiscardSize(code);
      expect(size).toBe(2);
    });
  });

  describe('getDiscardSize', () => {
    it('reflects accurate count after pushes and pops', async () => {
      expect(await yanivDiscard.getDiscardSize(code)).toBe(0);
      await yanivDiscard.pushDiscard(code, [aceOfSpades, twoOfHearts]);
      expect(await yanivDiscard.getDiscardSize(code)).toBe(2);
      await yanivDiscard.popDiscard(code);
      expect(await yanivDiscard.getDiscardSize(code)).toBe(1);
    });
  });

  describe('discardExists', () => {
    it('returns true after a card is pushed', async () => {
      await yanivDiscard.pushDiscard(code, aceOfSpades);
      expect(await yanivDiscard.discardExists(code)).toBe(true);
    });

    it('returns false after the pile is drained', async () => {
      await yanivDiscard.pushDiscard(code, aceOfSpades);
      await yanivDiscard.drainDiscard(code);
      expect(await yanivDiscard.discardExists(code)).toBe(false);
    });
  });

  describe('drainDiscard', () => {
    it('returns all cards top-first and clears the key', async () => {
      await yanivDiscard.pushDiscard(code, [
        aceOfSpades,
        twoOfHearts,
        threeOfDiamonds,
      ]);
      const drained = await yanivDiscard.drainDiscard(code);
      expect(drained).toEqual([threeOfDiamonds, twoOfHearts, aceOfSpades]);
      expect(await yanivDiscard.getDiscardSize(code)).toBe(0);
      expect(await redis.exists(discardKey(code))).toBe(0);
    });

    it('returns empty array when pile is empty', async () => {
      const drained = await yanivDiscard.drainDiscard(code);
      expect(drained).toEqual([]);
    });
  });
});
