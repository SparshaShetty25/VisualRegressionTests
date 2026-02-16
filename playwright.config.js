// @ts-check
const { defineConfig, devices } = require('@playwright/test');
require('dotenv').config();

/**
 * MPB Visual Regression Testing Configuration
 *
 * Optimized for pure Playwright async visual testing
 */

const config = {
  TLD: process.env.TLD || 'swan.koda-500.env.mpb.com',
  PROTOCOL: process.env.PROTOCOL || 'https',
  MOBILE_VIEW: process.env.MOBILE_VIEW === 'true',
  HEADLESS: process.env.HEADLESS !== 'false',
  VISUAL_THRESHOLD: parseFloat(process.env.VISUAL_THRESHOLD || '0.2'),
  WORKERS: parseInt(process.env.WORKERS || '3'),

  // Application URLs
  get TOUCAN_URL() { return `${this.PROTOCOL}://www.${this.TLD}` },
  get FLAMINGO_URL() { return `${this.PROTOCOL}://flamingo.${this.TLD}` },
  get SWAN_URL() { return `${this.PROTOCOL}://swan.${this.TLD}` },
  get GOOSE_URL() { return `${this.PROTOCOL}://identity.${this.TLD}` }
};

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,

  expect: {
    timeout: 10000,
    toHaveScreenshot: {
      threshold: config.VISUAL_THRESHOLD,
      mode: 'pixel',
      animations: 'disabled'
    }
  },

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : config.WORKERS,

  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['allure-playwright', { outputFolder: 'allure-results' }]
  ],

  use: {
    actionTimeout: 15000,
    navigationTimeout: 30000,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    headless: config.HEADLESS,
    viewport: config.MOBILE_VIEW
      ? { width: 375, height: 667 }
      : { width: 1920, height: 1080 },
    locale: 'en-GB',
    timezoneId: 'Europe/London',
    ignoreHTTPSErrors: true,
    extraHTTPHeaders: {
      'X-Test-Config': JSON.stringify(config)
    },
    // Optimized for headed mode debugging
    launchOptions: {
      slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0,
      devtools: process.env.DEVTOOLS === 'true'
    }
  },

  // No local webServer needed - testing remote applications

  projects: [
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
      testIgnore: ['**/swan/**']
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['iPhone SE'], viewport: { width: 375, height: 667 } }
    }
  ]
});