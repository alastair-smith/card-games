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

const createDeckStore = <T>(gamePrefix: string, cardSchema: ZodType<T>) => {
  const getDeckKey = (code: GameCode) => `deck:${gamePrefix}:${code}`;

  const createDeck = async (code: GameCode, cards: T[]) => {
    const key = getDeckKey(code);
    const pipeline = redis.pipeline();

    // Clear any old deck that might exist
    pipeline.del(key);

    // Add all cards to the list
    pipeline.rpush(key, ...cards.map((card) => JSON.stringify(card)));

    // Set expiry for the deck key
    pipeline.expire(key, REDIS_EXPIRE_TIME_SECONDS);

    await pipeline.exec();
  };

  const drawCard = async (code: GameCode): Promise<T | null> => {
    const key = getDeckKey(code);
    const cardJson = await redis.lpop(key);

    if (!cardJson) {
      return null;
    }

    const card = cardSchema.safeParse(JSON.parse(cardJson));

    if (!card.success) {
      throw new Error('Invalid card found in deck');
    }

    return card.data;
  };

  const drawCards = async (code: GameCode, count: number): Promise<T[]> => {
    const cards: T[] = [];
    for (let i = 0; i < count; i++) {
      const card = await drawCard(code);
      if (!card) throw new Error('Deck ran out of cards');
      cards.push(card);
    }
    return cards;
  };

  const deckExists = async (code: GameCode): Promise<boolean> => {
    const key = getDeckKey(code);
    const exists = await redis.exists(key);
    return exists === 1;
  };

  const getDeckSize = async (code: GameCode): Promise<number> => {
    const key = getDeckKey(code);
    return redis.llen(key);
  };

  return { createDeck, drawCard, drawCards, deckExists, getDeckSize };
};

export const highCardDeck = createDeckStore<StandardPlayingCard>(
  'high-card',
  standardPlayingCardSchema,
);

export const yanivDeck = createDeckStore<YanivPlayingCard>(
  'yaniv',
  yanivPlayingCardSchema,
);

// Backward-compatible named exports for high-card
export const { createDeck, drawCard, deckExists, getDeckSize } = highCardDeck;
