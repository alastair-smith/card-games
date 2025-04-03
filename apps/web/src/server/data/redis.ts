import Redis from 'ioredis';
import { type z } from "zod";

// data connection
export const redis = new Redis();

export enum DataServiceErrorCode {
  NOT_FOUND = 'NOT_FOUND',
  INVALID_KEY = 'INVALID_KEY',
  SERVER_ERROR = 'SERVER_ERROR'
};

export class DataServiceError extends Error {
  static name: 'DataServiceError';

  code: DataServiceErrorCode;

  constructor(message: string, opts: { cause?: unknown, code: DataServiceErrorCode }) {
    super(message, opts.cause ? { cause: opts.cause } : undefined);

    this.code = opts.code;
  }
}

/** Generate typed redis data interaction functions with validation layers. */
export const dataLayer = <T extends z.ZodType, P extends Record<string, string>>(getKey: (keyArgs: P) => string, schema: T) => ({
  exists: async (keyArgs: P) => {
    const key = getKey(keyArgs);
    const exists = await redis.exists(key);

    return exists === 1;
  },

  /** Retrieve from redis */
  get: async (keyArgs: P): Promise<z.infer<T>> => {
    const key = getKey(keyArgs);

    const raw = await redis.get(key);

    if (!raw) {
      throw new DataServiceError(`Data not found for key: ${key}`, { code: DataServiceErrorCode.NOT_FOUND });
    }

    const parsed = schema.safeParse(JSON.parse(raw));

    if (parsed.error) {
      throw new DataServiceError(`GetDataError for key: ${key} is invalid.`, { cause: parsed.error, code: DataServiceErrorCode.INVALID_KEY });
    }

    return parsed.data;
  },

  /** Store in redis */
  set: async (keyArgs: P, data: z.infer<T>): Promise<z.infer<T>> => {
    const key = getKey(keyArgs);
    const parsed = schema.safeParse(data);

    if (parsed.error) {
      throw new DataServiceError(`SetData for key: ${key} is invalid.`, { cause: parsed.error, code: DataServiceErrorCode.INVALID_KEY });
    }

    await redis.set(key, JSON.stringify(parsed.data));

    return parsed.data;
  },
})

