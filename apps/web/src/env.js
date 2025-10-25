import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    AUTH_SECRET: z.string().min(32),
    LOG_LEVEL: z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
      .default('info'),
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    PORT: z
      .string()
      .default('3000')
      .transform((val) => z.number().int().positive().parse(Number(val))),
    GIT_COMMIT_HASH: z.string().default('unknown'),
  },
  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    // non-undefined value requried at build time
    LOG_LEVEL: process.env.LOG_LEVEL ?? 'info',
    PORT: process.env.PORT,
    GIT_COMMIT_HASH: process.env.GIT_COMMIT_HASH,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
