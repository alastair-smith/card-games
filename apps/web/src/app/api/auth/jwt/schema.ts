import { z } from "zod";

export const ERROR_PREFIX = "Login Error:";

export const callbackSchema = z.string();

export const requestSchema = z.object({
  callback :callbackSchema,
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
  z.string(),
]);

export type ResponseSchema = z.infer<typeof responseSchema>;
