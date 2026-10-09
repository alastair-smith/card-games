import Redis, { type ChainableCommander } from 'ioredis';
import type { z } from 'zod';
import { env } from '~/env';

// data connection
export const redis = new Redis(env.REDIS_CONNECTION_STRING);

export const REDIS_EXPIRE_TIME_SECONDS = 60 * 60 * 24; // 24 hours

export enum DataServiceErrorCode {
  NOT_FOUND = 'NOT_FOUND',
  INVALID_KEY = 'INVALID_KEY',
  SERVER_ERROR = 'SERVER_ERROR',
}

export class DataServiceError extends Error {
  static name: 'DataServiceError';

  code: DataServiceErrorCode;

  constructor(
    message: string,
    opts: { cause?: unknown; code: DataServiceErrorCode },
  ) {
    super(message, opts.cause ? { cause: opts.cause } : undefined);

    this.code = opts.code;
  }
}

/** Run the writes queued by `queueWrites` atomically in one MULTI. */
export const runTransaction = async (
  queueWrites: (transaction: ChainableCommander) => void,
): Promise<void> => {
  const transaction = redis.multi();
  queueWrites(transaction);
  const results = await transaction.exec();

  const failure = results?.find(([error]) => error)?.[0];
  if (!results || failure) {
    throw new DataServiceError('Transaction failed', {
      cause: failure,
      code: DataServiceErrorCode.SERVER_ERROR,
    });
  }
};

/** Generate typed redis data interaction functions with validation layers. */
export const dataLayer = <
  T extends z.ZodType,
  P extends Record<string, string>,
>(
  getKey: (keyArgs: P) => string,
  schema: T,
) => {
  const validate = (key: string, data: z.infer<T>): z.infer<T> => {
    const parsed = schema.safeParse(data);

    if (parsed.error) {
      throw new DataServiceError(`SetData for key: ${key} is invalid.`, {
        cause: parsed.error,
        code: DataServiceErrorCode.INVALID_KEY,
      });
    }

    return parsed.data;
  };

  return {
    /** Verify record exists */
    exists: async (keyArgs: P) => {
      const key = getKey(keyArgs);
      const exists = await redis.exists(key);

      return exists === 1;
    },

    /** Retrieve from redis */
    get: async (keyArgs: P): Promise<z.infer<T> | null> => {
      const key = getKey(keyArgs);

      const raw = await redis.get(key);

      if (!raw) {
        return null;
      }

      const parsed = schema.safeParse(JSON.parse(raw));

      if (parsed.error) {
        throw new DataServiceError(`GetDataError for key: ${key} is invalid.`, {
          cause: parsed.error,
          code: DataServiceErrorCode.INVALID_KEY,
        });
      }

      return parsed.data;
    },

    /** Store in redis */
    set: async (keyArgs: P, data: z.infer<T>): Promise<z.infer<T>> => {
      const key = getKey(keyArgs);
      const validated = validate(key, data);

      await redis.set(
        key,
        JSON.stringify(validated),
        'EX',
        REDIS_EXPIRE_TIME_SECONDS,
      );

      return validated;
    },

    /** Queue a store onto a transaction from `runTransaction` */
    queueSet: (
      transaction: ChainableCommander,
      keyArgs: P,
      data: z.infer<T>,
    ): void => {
      const key = getKey(keyArgs);
      const validated = validate(key, data);

      transaction.set(
        key,
        JSON.stringify(validated),
        'EX',
        REDIS_EXPIRE_TIME_SECONDS,
      );
    },
  };
};
