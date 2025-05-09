import pino from 'pino';

import { env } from '@/env';

const initLogger = () => {
  const base = {
    service: 'card-games',
    env: env.NODE_ENV,
    version: env.GIT_COMMIT_HASH,
  };

  const level = env.LOG_LEVEL;

  const transport = env.NODE_ENV === 'development'
    ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: `pid,hostname,${Object.keys(base).join(',')}`,
        sync: true  // Use sync mode in development
      },
    }
    : undefined;

  return pino({
    level,
    base,
    transport
  })
}

export const logger = initLogger();
