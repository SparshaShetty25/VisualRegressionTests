/**
 * Swan Application Visual Regression Tests
 *
 * Optimized implementation using fixtures to reduce duplication
 */

const { test, expect } = require('../../lib/fixtures');

test.describe('Swan Visual Regression Tests', () => {

    test.describe('Login Pages', () => {
        test('Swan login page visual @swan', async ({ publicPage }) => {
            const { page, tester } = publicPage;
            await tester.navigateToPage(page, '/login');
            await tester.takeScreenshot(page, 'swan-login-page.png');
        });

    });

    test.describe('Home Page', () => {
        test('Swan home page visual', async ({ authenticatedPage }) => {
            const { page, tester } = authenticatedPage;
            await tester.navigateToPage(page, '/');
            await tester.takeScreenshot(page, 'swan-home-page.png');
        });

        test('Swan receiving page visual', async ({ authenticatedPage }) => {
            const { page, tester } = authenticatedPage;
            await tester.navigateToPage(page, '/receiving');
            await tester.takeScreenshot(page, 'swan-receiving-page.png');
        });

        test('Swan picking page visual', async ({ authenticatedPage }) => {
            const { page, tester } = authenticatedPage;
            await tester.navigateToPage(page, '/picking');
            await tester.takeScreenshot(page, 'swan-picking-page.png');
        });

        test('Swan lookup page visual', async ({ authenticatedPage }) => {
            const { page, tester } = authenticatedPage;
            await tester.navigateToPage(page, '/lookup');
            await tester.takeScreenshot(page, 'swan-lookup-page.png');
        });
    });

});