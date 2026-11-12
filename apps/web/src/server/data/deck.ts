import type { ZodType } from 'zod';
import {
  REDIS_EXPIRE_TIME_SECONDS,
  redis,
  runTransaction,
} from '~/server/data/redis';
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
    await runTransaction(async (transaction) => {
      // Clear any old deck that might exist
      transaction.del(key);

      // Redis rejects an RPUSH with no values
      if (cards.length === 0) return;

      transaction
        .rpush(key, ...cards.map((card) => JSON.stringify(card)))
        .expire(key, REDIS_EXPIRE_TIME_SECONDS);
    });
  };

  const parseCard = (json: string) => {
    const card = cardSchema.safeParse(JSON.parse(json));
    if (!card.success) throw new Error('Invalid card found in deck');
    return card.data;
  };

  const drawCard = async (code: GameCode): Promise<T | null> => {
    const cardJson = await redis.lpop(getDeckKey(code));
    return cardJson ? parseCard(cardJson) : null;
  };

  // Without errorOnNoCards, takes whatever is left once the deck runs out
  const drawCards = async (
    code: GameCode,
    count: number,
    { errorOnNoCards }: { errorOnNoCards: boolean } = { errorOnNoCards: true },
  ): Promise<T[]> => {
    // Redis rejects a negative count
    if (count <= 0) return [];

    const cardJsons = (await redis.lpop(getDeckKey(code), count)) ?? [];
    if (errorOnNoCards && cardJsons.length < count) {
      throw new Error('Deck ran out of cards');
    }
    return cardJsons.map(parseCard);
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

export const shitheadDeck = createDeckStore<StandardPlayingCard>(
  'shithead',
  standardPlayingCardSchema,
);

// Backward-compatible named exports for high-card
export const { createDeck, drawCard, deckExists, getDeckSize } = highCardDeck;
