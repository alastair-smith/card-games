import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 5 * 60 * 1000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
  },
  webServer: {
    command: 'pnpm test:e2e:start-server',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      AUTH_SECRET:
        process.env.AUTH_SECRET ?? 'test-secret-at-least-32-characters-long!!',
      REDIS_CONNECTION_STRING:
        process.env.REDIS_CONNECTION_STRING ?? 'redis://localhost:6379',
      NODE_ENV: 'test',
      PORT: '3000',
    },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
