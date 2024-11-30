import type { z, ZodSchema } from "zod";

export const consume =
  <T extends ZodSchema<object>>(eventName: string, schema: T) =>
  (rawData: unknown, callback: (data: z.infer<T>) => void) => {
    const data = schema.parse(rawData);

    return callback(data);
  };
