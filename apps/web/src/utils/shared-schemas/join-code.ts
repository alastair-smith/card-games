import { GAME_CODE_LENGTH } from "@/server/api/routers/lobby/schemas";
import { z } from "zod";

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
  .describe("The code of the game to join")