import Redis from "ioredis";
import { z } from "zod";
import { lobbySchema } from "@/server/data/lobby";
import { GameCode } from "@/types/game";
import { logger } from "@/utils/logger";

const publisher = new Redis();
export const subscriber = new Redis();

const key = 'lobby';

export const publishLobbyState = async (code: GameCode, state: z.infer<typeof lobbySchema>) => {
  const validatedState = lobbySchema.parse(state);

  await publisher.publish(key, JSON.stringify(validatedState));
};

export const subscribeToLobbyState = async (): Promise<'Subscribed'> => {
  return new Promise((resolve, reject) => {
    subscriber.subscribe(key, (error, count) => {
      if (error) {
        reject(new Error(`Error subscribing to stream: ${error.message}`, { cause: error }));
      } else {
        logger.info(`Subscribed to ${key}, count: ${count}`);
        resolve('Subscribed');
      }
    });
  });
}

await subscribeToLobbyState();
