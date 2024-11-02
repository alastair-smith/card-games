import { z } from "zod";

export const requestSchema = z.object({
  name: z.string().min(1).max(64),
});

export type RequestSchema = z.infer<typeof requestSchema>;

export const responseSchema = z.union([
  z.object({
    error: z.string(),
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
