import type { z } from 'zod';
import { gameStateSchema } from '~/server/data/high-card';
import type { GameCode } from '~/types/game';
import { logger } from '~/utils/logger';
import { publisher, subscriber } from './connections';

export const getHighCardChannel = (
  code: GameCode | '*',
): `high-card:${GameCode | '*'}` => `high-card:${code}`;

export const publishHighCard = async (
  code: GameCode,
  state: z.infer<typeof gameStateSchema>,
) => {
  const validatedState = gameStateSchema.parse(state);

  await publisher.publish(
    getHighCardChannel(code),
    JSON.stringify(validatedState),
  );
};

let subscription = false;

/**
 * A subscription is required in order to listen to the messages.
 * The same subscription can be shared between multiple games.
 */
export const subscribeToHighCardState = async () => {
  if (!subscription) {
    subscription = await new Promise((resolve, reject) => {
      subscriber.psubscribe(getHighCardChannel('*'), (error, count) => {
        if (error) {
          reject(
            new Error(`Error subscribing to stream: ${error.message}`, {
              cause: error,
            }),
          );
        } else {
          logger.info(
            `Subscribed to ${getHighCardChannel('*')}, count: ${count}`,
          );
          resolve(true);
        }
      });
    });
  }
};
