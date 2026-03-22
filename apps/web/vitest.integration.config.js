import path from 'node:path';

export default {
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.integration.test.ts'],
    env: {
      REDIS_CONNECTION_STRING:
        process.env.REDIS_CONNECTION_STRING ?? 'redis://localhost:6379',
      AUTH_SECRET: 'integration-test-secret-at-least-32-chars-long',
      NODE_ENV: 'test',
    },
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
    },
  },
};
