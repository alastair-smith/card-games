import { z } from "zod";

export const joinSchema = z.object({
  code: z
    .preprocess(
      (value) => (typeof value === "string" ? value.trimEnd() : value),
      z
        .string()
        .length(6, { message: "Codes must be 6 characters long." })
        .regex(/^[a-zA-Z0-9]{6}$/, {
          message: "Codes only consist of numbers and letters.",
        }),
    )
    .transform((value) => value.toUpperCase())
    .describe("The code of the game to join"),
});
