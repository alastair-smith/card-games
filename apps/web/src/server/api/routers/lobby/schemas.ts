import { z } from "zod";

export const GAME_CODE_LENGTH = 6;

export const joinSchema = z.object({
  code: z
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
    .describe("The code of the game to join"),
});
