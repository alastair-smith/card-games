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

  const parseCard = (json: string) => {
    const card = cardSchema.safeParse(JSON.parse(json));
    if (!card.success) throw new Error('Invalid card found in discard pile');
    return card.data;
  };

  // Clears any old discard pile that might exist
  const createDiscard = async (code: GameCode) => {
    await redis.del(getDiscardKey(code));
  };

  // Sets the expiry on every push, as the key is recreated after each drain
  const pushDiscard = async (code: GameCode, card: T | T[]) => {
    const key = getDiscardKey(code);
    const cards = Array.isArray(card) ? card : [card];
    // Redis rejects an RPUSH with no values
    if (cards.length === 0) return;

    await redis
      .pipeline()
      .rpush(key, ...cards.map((singleCard) => JSON.stringify(singleCard)))
      .expire(key, REDIS_EXPIRE_TIME_SECONDS)
      .exec();
  };

  const popDiscard = async (code: GameCode): Promise<T | null> => {
    const key = getDiscardKey(code);
    const cardJson = await redis.rpop(key);
    return cardJson ? parseCard(cardJson) : null;
  };

  const peekDiscard = async (code: GameCode): Promise<T | null> => {
    const key = getDiscardKey(code);
    const cardJson = await redis.lindex(key, -1);
    return cardJson ? parseCard(cardJson) : null;
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

  // Pops the top card then fetches and clears the rest in one batch.
  // Returns all cards top-first.
  const drainDiscard = async (code: GameCode): Promise<T[]> => {
    const key = getDiscardKey(code);
    const topJson = await redis.rpop(key);
    if (!topJson) return [];

    const restJsons = await redis.lrange(key, 0, -1);
    await redis.del(key);

    // lrange returns bottom-to-top; reverse so remaining cards are also top-first
    return [parseCard(topJson), ...[...restJsons].reverse().map(parseCard)];
  };

  // Returns all cards top-first, leaving the pile in place.
  const getDiscardCards = async (code: GameCode): Promise<T[]> => {
    const cardJsons = await redis.lrange(getDiscardKey(code), 0, -1);
    return [...cardJsons].reverse().map(parseCard);
  };

  return {
    createDiscard,
    pushDiscard,
    popDiscard,
    peekDiscard,
    discardExists,
    getDiscardSize,
    drainDiscard,
    getDiscardCards,
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

export const shitheadDiscard = createDiscardStore<StandardPlayingCard>(
  'shithead',
  standardPlayingCardSchema,
);
