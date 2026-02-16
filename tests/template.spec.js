/**
 * Template for Visual Regression Tests
 *
 * Copy this file to create tests for other applications:
 * - tests/toucan/toucan.spec.js
 * - tests/flamingo/flamingo.spec.js
 * - tests/goose/goose.spec.js
 *
 * Replace 'APP_NAME' with your application name throughout
 */

const { test, expect } = require('@playwright/test');
const { BaseVisualTester } = require('../lib/base-tester');

test.describe('APP_NAME Visual Regression Tests', () => {
    let appTester;

    test.beforeEach(async ({ page }) => {
        appTester = new BaseVisualTester('APP_NAME');
        await appTester.setupPage(page);
    });

    test('APP_NAME login page visual', async ({ page }) => {
        await appTester.navigateToPage(page, '/login');
        await appTester.takeScreenshot(page, 'APP_NAME-login-page.png');
    });

    test('APP_NAME home page visual', async ({ page }) => {
        await appTester.navigateToPage(page, '/login');
        await appTester.authenticatePage(page);
        await appTester.navigateToPage(page, '/');
        await appTester.takeScreenshot(page, 'APP_NAME-home-page.png');
    });

    test('APP_NAME specific feature visual', async ({ page }) => {
        await appTester.navigateToPage(page, '/login');
        await appTester.authenticatePage(page);
        await appTester.navigateToPage(page, '/feature-path');

        // Hide dynamic elements specific to this page
        await appTester.takeScreenshot(page, 'APP_NAME-feature-page.png', {
            additionalSelectors: [
                '[data-testid="live-counter"]',
                '.real-time-data'
            ]
        });
    });

    test('APP_NAME mobile view visual', async ({ page, isMobile }) => {
        test.skip(!isMobile, 'Mobile-only test');

        await appTester.navigateToPage(page, '/login');
        await appTester.takeScreenshot(page, 'APP_NAME-login-mobile.png');
    });

    test('APP_NAME error page visual', async ({ page }) => {
        await appTester.navigateToPage(page, '/non-existent-path');
        await appTester.takeScreenshot(page, 'APP_NAME-404-page.png');
    });
});

/*
Usage Instructions:
===================

1. Copy this file to tests/{app_name}/{app_name}.spec.js
2. Replace all instances of 'APP_NAME' with your application name
3. Update the feature paths and test scenarios for your application
4. Run tests with: npm run test:{app_name}

Example for Toucan:
- File: tests/toucan/toucan.spec.js
- Replace: APP_NAME → toucan
- Update paths: /login, /, /products, etc.

Running tests:
- npm test                    (all tests)
- npm run test:toucan         (toucan only)
- npm run test:mobile         (mobile viewport)
- npm run test:update         (update baselines)
*/