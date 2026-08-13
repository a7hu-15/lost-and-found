import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 45000,
  expect: {
    timeout: 10000
  },
  fullyParallel: false,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['json', { outputFile: 'reports/json/results.json' }]
  ],
  use: {
    baseURL: 'http://127.0.0.1:5173',
    ignoreHTTPSErrors: true,
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 10000,
    navigationTimeout: 15000,
    trace: 'retain-on-failure',
    screenshot: 'on',
    video: 'on-first-retry'
  },
  projects: [
    {
      name: 'Phase 3 QA - Chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
