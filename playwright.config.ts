import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for E2E testing
 * Tests run against production build for faster execution
 * Usage:
 *   - Run tests: npm run test:e2e
 *   - Run with UI: npm run test:e2e:ui
 *   - First build: npm run build && npm run test:e2e
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: !process.env.CI,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 10000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Run tests in fewer browsers locally for speed
    ...(process.env.CI
      ? [
          {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
          },
          {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
          },
        ]
      : []),
  ],
  // Use production build for testing (much faster than dev server)
  webServer:
    process.env.CI || process.env.SKIP_WEBSERVER
      ? undefined
      : {
          command: 'npm run build && npm start',
          url: 'http://localhost:3000',
          timeout: 300000, // 5 minutes for build + start
          reuseExistingServer: true, // Reuse if already running
        },
});
