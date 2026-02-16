/**
 * Base Visual Tester - Async Playwright Implementation
 *
 * Extracted and optimized from WebdriverTests framework
 */

const { expect } = require('@playwright/test');
const { getUserCredentials } = require('./test-users');

class BaseVisualTester {
    constructor(appName, config = {}) {
        this.appName = appName.toLowerCase();
        this.config = {
            timeout: 60000,
            visualThreshold: 0.1,
            animationsDisabled: true,
            ...config
        };

        this.baseUrl = this.getBaseUrlForApp(appName);
    }

    getBaseUrlForApp(appName) {
        const testConfig = JSON.parse(process.env.TEST_CONFIG || '{}');
        const tld = testConfig.TLD || 'staging.env.mpb.com';
        const protocol = testConfig.PROTOCOL || 'https';

        const urls = {
            toucan: `${protocol}://www.${tld}`,
            flamingo: `${protocol}://flamingo.${tld}`,
            swan: `${protocol}://swan.${tld}`,
            goose: `${protocol}://identity.${tld}`
        };

        if (!urls[appName.toLowerCase()]) {
            throw new Error(`Unknown application: ${appName}`);
        }

        return urls[appName.toLowerCase()];
    }

    async setupPage(page) {
        // Set timeout
        page.setDefaultTimeout(this.config.timeout);

        // Disable animations for consistent screenshots
        if (this.config.animationsDisabled) {
            await page.addInitScript(`
                const css = \`
                    *, *::before, *::after {
                        animation-delay: 0s !important;
                        animation-duration: 0s !important;
                        animation-fill-mode: both !important;
                        transition-delay: 0s !important;
                        transition-duration: 0s !important;
                        caret-color: transparent !important;
                    }
                \`;
                const style = document.createElement('style');
                style.textContent = css;
                if (document.head) {
                    document.head.appendChild(style);
                } else {
                    document.addEventListener('DOMContentLoaded', () => {
                        document.head.appendChild(style);
                    });
                }
            `);
        }
    }

    async authenticatePage(page, userType = 'default') {
        try {
            // Get appropriate test user credentials
            const authData = typeof userType === 'string'
                ? getUserCredentials(userType)
                : userType; // Allow passing custom credentials object

            // Navigate to login if not authenticated
            const currentUrl = page.url();
            if (!currentUrl.includes('/login') && !this.isAuthenticated(currentUrl)) {
                await this.navigateToPage(page, '/login');
            }

            // First click on Login field/button to reveal email inputs
            try {
                await page.click('//button[@data-testid="login__submit"]', {
                    timeout: 5000
                });
                await page.waitForTimeout(1000); // Wait for form to appear
            } catch (e) {
                console.log('No login button to click, proceeding to find email field');
            }

            // Wait for login form to be ready
            await page.waitForSelector('[data-testid="email"], input[type="email"], #email', {
                timeout: 10000
            });

            // Fill login form
            await page.fill('[data-testid="email"], input[type="email"], #email', authData.email);
            await page.fill('[data-testid="password"], input[type="password"], #password', authData.password);

            // Submit form
            await page.click('[data-testid="login-submit"], button[type="submit"], .login-submit');

            // Wait for successful authentication
            await page.waitForURL(url => !url.includes('/login'), { timeout: 15000 });
            await this.waitForAppReady(page);

        } catch (error) {
            console.warn(`Authentication failed for ${this.appName}: ${error.message}`);
            // Continue without authentication for public pages
        }
    }

    isAuthenticated(url) {
        // Simple check - enhance based on your app patterns
        return !url.includes('/login') && !url.includes('/auth');
    }

    async navigateToPage(page, path = '') {
        const url = `${this.baseUrl}${path}`;
        await page.goto(url, { waitUntil: 'networkidle' });

        await this.waitForAppReady(page);
    }

    async waitForAppReady(page) {
        // Wait for common loading indicators to disappear
        const loaderSelectors = [
            '[data-testid="loader"]',
            '.loader',
            '.loading',
            '.spinner',
            '[data-testid="loading"]'
        ];

        for (const selector of loaderSelectors) {
            try {
                await page.waitForSelector(selector, {
                    state: 'hidden',
                    timeout: 5000
                });
            } catch {
                // Loader might not exist on this page
                continue;
            }
        }

        // Additional wait for dynamic content
        await page.waitForTimeout(1000);
    }

    async hideDynamicElements(page, additionalSelectors = []) {
        const defaultSelectors = [
            '[data-testid="timestamp"]',
            '[data-testid="loader"]',
            '.timestamp',
            '.last-updated',
            '.current-time',
            '.toast-notification',
            '.loading-spinner',
            '.loader'
        ];

        const allSelectors = [...defaultSelectors, ...additionalSelectors];
        const selectorsCSS = allSelectors.join(', ');

        await page.addStyleTag({
            content: `
                ${selectorsCSS} {
                    visibility: hidden !important;
                }
            `
        });
    }

    async takeScreenshot(page, name, options = {}) {
        const defaultOptions = {
            fullPage: true,
            animations: 'disabled',
            ...options
        };

        // Hide dynamic elements
        await this.hideDynamicElements(page, options.additionalSelectors);

        // Wait for page to settle
        await page.waitForTimeout(1000);

        // Use Playwright's built-in visual comparison
        await expect(page).toHaveScreenshot(name, defaultOptions);
    }

    getDomainForApp() {
        return new URL(this.baseUrl).hostname;
    }
}

module.exports = { BaseVisualTester };