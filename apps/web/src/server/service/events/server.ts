/** For server <---> Redis communication */

import Redis from "ioredis";
import { z } from "zod";
import { lobbySchema } from "../data/lobby";
import { GameCode } from "@/types/game";

const publisher = new Redis();
export const subscriber = new Redis();


const redisPub = new Redis(process.env.REDIS_URL!); // Separate Redis instance for publishing

export const publishGameUpdate = async (code: GameCode, state: z.infer<typeof lobbySchema>) => {
  // Ensure the state follows the schema
  const validatedState = lobbySchema.parse(state);

  // Add the state update to the Redis Stream
  await redisPub.xadd(
    `game:${code}`,  // Stream key
    "MAXLEN", "1000",         // Trim old messages (keep latest ~1000)
    "*",                       // Auto-generate message ID
    "data", JSON.stringify(validatedState) // Store game state as JSON
  );

  console.log(`Published game update for ${code}`);
};
