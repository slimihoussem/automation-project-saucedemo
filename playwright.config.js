// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './playwright_tests',

  /* ⏱ Global timeout */
  timeout: 30 * 1000,

  expect: {
    timeout: 5000,
  },

  /* CI behavior */
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  /* 📊 Reporters (Jenkins-friendly) */
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports', open: 'never' }],
  ],

  /* ⚙️ Shared settings */
  use: {
    headless: true, // ✅ REQUIRED for Jenkins
    baseURL: 'https://www.saucedemo.com',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },

  /* 🌐 Browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Enable later if needed
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
});
