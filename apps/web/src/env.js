import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  client: {
    NEXT_PUBLIC_GIT_COMMIT_HASH: z.string().default('unknown'),
  },
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
    REDIS_CONNECTION_STRING: z.string(),
    ADMIN_USERNAME: z.string().optional(),
    ADMIN_PASSWORD: z.string().optional(),
    OTEL_EXPORTER_OTLP_ENDPOINT: z.string().default('http://localhost:4318'),
    NEW_RELIC_LICENSE_KEY: z.string().optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_GIT_COMMIT_HASH: process.env.NEXT_PUBLIC_GIT_COMMIT_HASH,
    AUTH_SECRET: process.env.AUTH_SECRET,
    // non-undefined value requried at build time
    LOG_LEVEL: process.env.LOG_LEVEL ?? 'info',
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    REDIS_CONNECTION_STRING: process.env.REDIS_CONNECTION_STRING,
    ADMIN_USERNAME: process.env.ADMIN_USERNAME,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    OTEL_EXPORTER_OTLP_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
    NEW_RELIC_LICENSE_KEY: process.env.NEW_RELIC_LICENSE_KEY,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
