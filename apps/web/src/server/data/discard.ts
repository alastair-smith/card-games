import type { ZodType } from 'zod';
import { REDIS_EXPIRE_TIME_SECONDS, redis } from '~/server/data/redis';
import {
  type StandardPlayingCard,
  standardPlayingCardSchema,
} from '~/types/cards';
import type { GameCode } from '~/types/game';
import {
  type YanivPlayingCard,
  yanivPlayingCardSchema,
} from '~/types/games/yaniv';

const createDiscardStore = <T>(gamePrefix: string, cardSchema: ZodType<T>) => {
  const getDiscardKey = (code: GameCode) => `discard:${gamePrefix}:${code}`;

  const createDiscard = async (code: GameCode) => {
    const key = getDiscardKey(code);
    const pipeline = redis.pipeline();

    // Clear any old discard pile that might exist
    pipeline.del(key);

    // Set expiry for the discard key
    pipeline.expire(key, REDIS_EXPIRE_TIME_SECONDS);

    await pipeline.exec();
  };

  const pushDiscard = async (code: GameCode, card: T | T[]) => {
    const key = getDiscardKey(code);
    const cards = Array.isArray(card) ? card : [card];
    for (const singleCard of cards) {
      await redis.rpush(key, JSON.stringify(singleCard));
    }
  };

  const popDiscard = async (code: GameCode): Promise<T | null> => {
    const key = getDiscardKey(code);
    const cardJson = await redis.rpop(key);

    if (!cardJson) {
      return null;
    }

    const card = cardSchema.safeParse(JSON.parse(cardJson));

    if (!card.success) {
      throw new Error('Invalid card found in discard pile');
    }

    return card.data;
  };

  const peekDiscard = async (code: GameCode): Promise<T | null> => {
    const key = getDiscardKey(code);
    const cardJson = await redis.lindex(key, -1);

    if (!cardJson) {
      return null;
    }

    const card = cardSchema.safeParse(JSON.parse(cardJson));

    if (!card.success) {
      throw new Error('Invalid card found in discard pile');
    }

    return card.data;
  };

  const discardExists = async (code: GameCode): Promise<boolean> => {
    const key = getDiscardKey(code);
    const exists = await redis.exists(key);
    return exists === 1;
  };

  const getDiscardSize = async (code: GameCode): Promise<number> => {
    const key = getDiscardKey(code);
    return redis.llen(key);
  };

  return {
    createDiscard,
    pushDiscard,
    popDiscard,
    peekDiscard,
    discardExists,
    getDiscardSize,
  };
};

export const highCardDiscard = createDiscardStore<StandardPlayingCard>(
  'high-card',
  standardPlayingCardSchema,
);

export const yanivDiscard = createDiscardStore<YanivPlayingCard>(
  'yaniv',
  yanivPlayingCardSchema,
);
