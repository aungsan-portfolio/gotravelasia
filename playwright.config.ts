import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './playwright/tests',
  retries: 2,

  use: {
    baseURL: process.env.BASE_URL || 'https://gotravel-asia.vercel.app',
    trace: 'on-first-retry',
  },
});
