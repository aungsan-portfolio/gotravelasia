import { defineConfig } from '@playwright/test';

// When BASE_URL is set (CI), tests run against the deployed Vercel URL.
// No local webServer is needed.
const useExternalUrl = !!process.env.BASE_URL;

export default defineConfig({
  testDir: './playwright/tests',
  retries: 2,

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  // Only start a local dev server when no BASE_URL is provided.
  ...(useExternalUrl
    ? {}
    : {
        webServer: {
          command: 'pnpm dev',
          url: 'http://localhost:3000',
          reuseExistingServer: true,
          timeout: 300 * 1000,
        },
      }),
});
