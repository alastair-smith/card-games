import Redis from "ioredis";
import { z } from "zod";
import { lobbySchema } from "../data/lobby";
import { GameCode } from "@/types/game";

const publisher = new Redis();

export const publishLobbyState = async (code: GameCode, state: z.infer<typeof lobbySchema>) => {
  // Ensure the state follows the schema
  const validatedState = lobbySchema.parse(state);

  // Add the state update to the Redis Stream
  await publisher.publish(`game:${code}`, JSON.stringify(validatedState));

  console.log(`Published game update for ${code}`);
};
