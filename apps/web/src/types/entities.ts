import { z } from "zod";

import { GAME_CODE_LENGTH } from "@/server/api/routers/lobby/schemas";
import { type UUID } from "crypto";

export const joinCodeSchema = z
  .preprocess(
    (value) => (typeof value === "string" ? value.trimEnd() : value),
    z
      .string()
      .length(6, {
        message: `Codes must be ${GAME_CODE_LENGTH} characters long.`,
      })
      .regex(/^[a-zA-Z0-9]*$/, {
        message: "Codes only consist of numbers and letters.",
      }),
  )
  .transform((value) => value.toUpperCase())
  .describe("The code of the game to join");

export type JoinCode = z.infer<typeof joinCodeSchema>;

export const playerIdSchema = z.string().uuid().transform(
  (value) => value as UUID
).describe("Unique identifier for the player");

export type PlayerId = z.infer<typeof playerIdSchema>;

export type UserId = PlayerId;

export const playerNameSchema = z.string().min(1).max(20).describe("The name of the player");

export type PlayerName = z.infer<typeof playerNameSchema>;