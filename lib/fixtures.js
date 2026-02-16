/**
 * Test Fixtures for Visual Regression Tests
 * Provides reusable authenticated and non-authenticated page states
 */

const { test: base } = require('@playwright/test');
const { BaseVisualTester } = require('./base-tester');

// Authenticated page fixture
const test = base.extend({
    // Authenticated page for app tests
    authenticatedPage: async ({ page }, use, testInfo) => {
        const appName = testInfo.project.name.includes('swan') ? 'swan' :
                       testInfo.project.name.includes('toucan') ? 'toucan' :
                       testInfo.project.name.includes('flamingo') ? 'flamingo' :
                       testInfo.project.name.includes('goose') ? 'goose' : 'swan';

        const tester = new BaseVisualTester(appName);
        await tester.setupPage(page);
        await tester.navigateToPage(page, '/login');
        await tester.authenticatePage(page);

        await use({ page, tester });
    },

    // Non-authenticated page for login/public pages
    publicPage: async ({ page }, use, testInfo) => {
        const appName = testInfo.project.name.includes('swan') ? 'swan' :
                       testInfo.project.name.includes('toucan') ? 'toucan' :
                       testInfo.project.name.includes('flamingo') ? 'flamingo' :
                       testInfo.project.name.includes('goose') ? 'goose' : 'swan';

        const tester = new BaseVisualTester(appName);
        await tester.setupPage(page);

        await use({ page, tester });
    },

    // Mobile authenticated page
    mobileAuthPage: async ({ page, isMobile }, use, testInfo) => {
        base.skip(!isMobile, 'Mobile-only test');

        const appName = testInfo.project.name.includes('swan') ? 'swan' :
                       testInfo.project.name.includes('toucan') ? 'toucan' :
                       testInfo.project.name.includes('flamingo') ? 'flamingo' :
                       testInfo.project.name.includes('goose') ? 'goose' : 'swan';

        const tester = new BaseVisualTester(appName);
        await tester.setupPage(page);
        await tester.navigateToPage(page, '/login');
        await tester.authenticatePage(page);

        await use({ page, tester });
    }
});

module.exports = { test, expect: base.expect };