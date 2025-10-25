import { redis } from '~/server/data/redis';
import {
  type StandardPlayingCard,
  standardPlayingCardSchema,
} from '~/types/cards';
import type { GameCode } from '~/types/game';

const getDeckKey = (code: GameCode) => `deck:high-card:${code}`;

export const createDeck = async (
  code: GameCode,
  cards: StandardPlayingCard[],
) => {
  const key = getDeckKey(code);
  const pipeline = redis.pipeline();

  // Clear any old deck that might exist
  pipeline.del(key);

  // Add all cards to the list
  pipeline.rpush(key, ...cards.map((card) => JSON.stringify(card)));

  await pipeline.exec();
};

export const drawCard = async (
  code: GameCode,
): Promise<StandardPlayingCard | null> => {
  const key = getDeckKey(code);
  const cardJson = await redis.lpop(key);

  if (!cardJson) {
    return null;
  }

  const card = standardPlayingCardSchema.safeParse(JSON.parse(cardJson));

  if (!card.success) {
    throw new Error('Invalid card found in deck');
  }

  return card.data;
};

export const deckExists = async (code: GameCode): Promise<boolean> => {
  const key = getDeckKey(code);
  const exists = await redis.exists(key);
  return exists === 1;
};

export const getDeckSize = async (code: GameCode): Promise<number> => {
  const key = getDeckKey(code);
  return redis.llen(key);
};
