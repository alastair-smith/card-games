import { z } from "zod";
import { gameTypeSchema, joinCodeSchema, playerIdSchema } from "../entities";

const lobby = z.object({
  joinCode: joinCodeSchema,
  gameType: gameTypeSchema
})

const lobbyPlayers = z.record(playerIdSchema, z.object({
  name: z.string(),
  ready: z.boolean()
}));
