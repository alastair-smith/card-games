import { z } from "zod";

import { Branded } from "./brand";

export type UserId = Branded<string, "UserId">;

export const userIdSchema = z.string().uuid().transform(
  (value) => value as UserId
)

export const playerNameSchema = z.string().min(1).max(20).describe("The name of the player");

export type PlayerName = z.infer<typeof playerNameSchema>;