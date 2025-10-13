import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'qa-tests/playwright',
  timeout: 60_000,
  retries: 0,
  use: {
    baseURL: 'http://127.0.0.1:5173',
    headless: true,
  },
  webServer: {
    command: process.platform === 'win32'
      ? 'npm run preview -- --port 5173 --strictPort'
      : 'npm run preview -- --port 5173 --strictPort',
    cwd: 'apps/main-app',
    port: 5173,
    reuseExistingServer: true,
    timeout: 120_000,
    env: {
      VITE_API_URL: 'http://127.0.0.1:3101/api',
      VITE_STRIPE_PUBLISHABLE_KEY: 'pk_test_1234567890ABCDEFG'
    }
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});

