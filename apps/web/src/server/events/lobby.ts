import Redis from "ioredis";
import { z } from "zod";
import { lobbySchema } from "@/server/data/lobby";
import { GameCode } from "@/types/game";
import { logger } from "@/utils/logger";

const publisher = new Redis();
export const subscriber = new Redis();

let subscription = false;

export const getLobbyChannel = (code: GameCode | '*'): `lobby:${GameCode | '*'}` => `lobby:${code}`;

export const publishLobbyState = async (code: GameCode, state: z.infer<typeof lobbySchema>) => {
  const validatedState = lobbySchema.parse(state);

  await publisher.publish(getLobbyChannel(code), JSON.stringify(validatedState));
};

const subscribeToLobbyState = async () => {
  if (!subscription) {
    subscription = await new Promise((resolve, reject) => {
      subscriber.psubscribe(getLobbyChannel('*'), (error, count) => {
        if (error) {
          reject(new Error(`Error subscribing to stream: ${error.message}`, { cause: error }));
        } else {
          logger.info(`Subscribed to ${getLobbyChannel('*')}, count: ${count}`);
          resolve(true);
        }
      });
    });
  }
}

await subscribeToLobbyState();
