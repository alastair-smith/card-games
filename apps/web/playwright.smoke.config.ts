import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: ['**/smoke.spec.ts'],
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    headless: true,
    trace: 'retain-on-failure',
  },
  // No webServer — the app must already be running (e.g. via docker-compose.test.yml)
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
  ],
});
