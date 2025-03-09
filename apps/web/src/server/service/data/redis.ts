import { redis } from "@/server/redis";
import { type z } from "zod";

/** Generate typed redis data interaction functions with validation layers. */
export const dataLayer = <T extends z.ZodType, P extends Record<string, string>>(getKey: (keyArgs: P) => string, schema: T) => ({
  /** Retrieve from redis */
  get: async (keyArgs: P): Promise<z.infer<T>> => {
    const key = getKey(keyArgs);

    const raw = await redis.get(key);

    if (!raw) {
      throw new Error(`Data not found for key: ${key}`);
    }

    const parsed = schema.safeParse(JSON.parse(raw));

    if (parsed.error) {
      throw new Error(`GetDataError for key: ${key} is invalid.`, { cause: parsed.error });
    }

    return parsed;
  },

  /** Store in redis */
  set: async (keyArgs: P, data: z.infer<T>) => {
    const key = getKey(keyArgs);
    const parsed = schema.safeParse(JSON.parse(data));

    if (parsed.error) {
      throw new Error(`SetData for key: ${key} is invalid.`, { cause: parsed.error });
    }

    await redis.set(key, JSON.stringify(parsed.data));
  },
})

