// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({

  testDir: './playwright_tests',

  /* ⏱ Timeout global */
  timeout: 30 * 1000,

  expect: {
    timeout: 5000,
  },

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  /* 📊 Reporter HTML (Jenkins-friendly) */
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports', open: 'never' }],
  ],

  /* ⚙️ Paramètres communs */
  use: {
    headless: true,                 // ✅ OBLIGATOIRE pour Jenkins
    baseURL: 'https://www.saucedemo.com',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },

  /* 🌐 Navigateurs */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
