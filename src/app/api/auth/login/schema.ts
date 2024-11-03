import { z } from "zod";

export const ERROR_PREFIX = "Login Error:";

export const playerNameSchema = z.string().min(1).max(64);

export const requestSchema = z.object({
  name: playerNameSchema.optional(),
});

export type RequestSchema = z.infer<typeof requestSchema>;

export const responseSchema = z.union([
  z.object({
    error: z.string().startsWith(ERROR_PREFIX),
    data: z.null(),
  }),
  z.object({
    error: z.null(),
    data: z.object({
      id: z.string(),
      name: z.string(),
    }),
  }),
]);

export type ResponseSchema = z.infer<typeof responseSchema>;
