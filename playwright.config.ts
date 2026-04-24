import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './playwright/tests',
  retries: 2,

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  webServer: {
    command: process.env.CI ? 'npm run start' : 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 300 * 1000,
  },
});
