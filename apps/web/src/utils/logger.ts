import { trace } from '@opentelemetry/api';
import pino from 'pino';

import { env } from '~/env';

const initLogger = () => {
  const base = {
    service: 'card-games',
    env: env.NODE_ENV,
    version: env.NEXT_PUBLIC_GIT_COMMIT_HASH,
  };

  const level = env.LOG_LEVEL;

  const transport =
    env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: `pid,hostname,${Object.keys(base).join(',')}`,
            sync: true, // Use sync mode in development
          },
        }
      : undefined;

  return pino({
    level,
    base,
    transport,
    mixin() {
      const span = trace.getActiveSpan();
      if (!span) return {};
      const context = span.spanContext();
      return {
        traceId: context.traceId,
        spanId: context.spanId,
        traceFlags: context.traceFlags,
      };
    },
  });
};

export const logger = initLogger();
