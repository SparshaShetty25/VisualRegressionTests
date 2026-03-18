/**
 * Test Users for Visual Regression Tests
 *
 * Simple predefined test users for consistent visual testing
 */

const TEST_USERS = {
    // Default authenticated user for most tests
    default: {
        email: 'dev@mpb.com',
        password: 'mpb'
    },

    // Swan-specific user
    swan: {
        email: 'dev@mpb.com',
        password: 'mpb'
    },

    // Guest user (for login page tests)
    guest: {
        email: 'admin@mpb.com',
        password: 'mpb'
    }
};

/**
 * Get test user credentials
 * @param {string} userType - 'default', 'swan', or 'guest'
 * @returns {object} User credentials
 */
function getTestUser(userType = 'default') {
    const user = TEST_USERS[userType];
    if (!user) {
        throw new Error(`Unknown user type: ${userType}. Available: ${Object.keys(TEST_USERS).join(', ')}`);
    }
    return user;
}

/**
 * Get user credentials from environment or fallback to test user
 * @param {string} userType - User type to get
 * @returns {object} User credentials
 */
function getUserCredentials(userType = 'default') {
    // Use environment variables if available, otherwise test users
    return {
        email: process.env.TEST_USER_EMAIL || getTestUser(userType).email,
        password: process.env.TEST_USER_PASSWORD || getTestUser(userType).password
    };
}

module.exports = {
    TEST_USERS,
    getTestUser,
    getUserCredentials
};