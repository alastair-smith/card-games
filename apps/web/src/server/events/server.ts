import Redis from "ioredis";
import { z } from "zod";
import { lobbySchema } from "@/server/data/lobby";
import { GameCode } from "@/types/game";

const publisher = new Redis();

export const publishLobbyState = async (code: GameCode, state: z.infer<typeof lobbySchema>) => {
  const validatedState = lobbySchema.parse(state);

  await publisher.publish(`game:${code}`, JSON.stringify(validatedState));
};
