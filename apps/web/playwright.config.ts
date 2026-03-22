import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/ui',
  outputDir: './tests/ui/.results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'dot' : 'list',
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    serviceWorkers: 'allow',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'] },
    },
  ],

  webServer: {
    command: 'node ./src/server.js',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    env: {
      NEXT_PUBLIC_API_MOCKING: 'enabled',
      PORT: '3001',
      AUTH_SECRET: 'playwright-test-secret-placeholder-32ch!',
      REDIS_CONNECTION_STRING: 'redis://localhost:6379',
    },
    timeout: 120_000,
  },
});
