import type { z } from 'zod';
import { lobbySchema } from '~/server/data/lobby';
import type { GameCode } from '~/types/game';
import { logger } from '~/utils/logger';
import { publisher, subscriber } from './connections';

export const getLobbyChannel = (
  code: GameCode | '*',
): `lobby:${GameCode | '*'}` => `lobby:${code}`;

export const publishLobbyState = async (
  code: GameCode,
  state: z.infer<typeof lobbySchema>,
) => {
  const validatedState = lobbySchema.parse(state);

  await publisher.publish(
    getLobbyChannel(code),
    JSON.stringify(validatedState),
  );
};

let subscription = false;

/**
 * A subscription is required in order to listen to the messages.
 * The same subscription can be shared between multiple games.
 */
export const subscribeToLobbyState = async () => {
  if (!subscription) {
    subscription = await new Promise((resolve, reject) => {
      // subscribe for all lobbies
      subscriber.psubscribe(getLobbyChannel('*'), (error, count) => {
        if (error) {
          reject(
            new Error(`Error subscribing to stream: ${error.message}`, {
              cause: error,
            }),
          );
        } else {
          logger.info(`Subscribed to ${getLobbyChannel('*')}, count: ${count}`);
          resolve(true);
        }
      });
    });
  }
};
