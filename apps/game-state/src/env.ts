import { z } from "zod";

const schema = z.object({
  // DATABASE_URL: z.string().url(),
  PORT: z.string().default('3001').transform(val => z.number().int().positive().parse(Number(val))),
});

export const env = schema.parse(process.env);