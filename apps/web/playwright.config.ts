import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 10 * 60 * 1000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    trace: 'retain-on-failure',
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
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'chromium-mobile', use: { ...devices['Pixel 7'] } },
    { name: 'firefox-desktop', use: { ...devices['Desktop Firefox'] } },
    {
      name: 'firefox-mobile',
      use: { browserName: 'firefox', viewport: { width: 393, height: 727 } },
    },
    { name: 'webkit-desktop', use: { ...devices['Desktop Safari'] } },
    { name: 'webkit-mobile', use: { ...devices['iPhone 14'] } },
  ],
});
