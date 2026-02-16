# MPB Visual Regression Tests

Dedicated Playwright-based visual regression testing suite for MPB applications.

## Overview

This repository provides fast, reliable visual regression testing for:
- **Toucan** - Customer-facing Re.Commerce website
- **Flamingo** - Internal admin/backoffice system
- **Swan** - Warehouse/inventory management system
- **Goose** - Identity/authentication service

## Architecture Benefits

✅ **Pure Playwright** - Async API optimized for visual testing
✅ **Independent execution** - No impact on functional E2E test performance
✅ **Frontend pipeline integration** - Fast feedback on UI changes
✅ **Cross-browser & mobile** - Desktop and mobile viewport testing
✅ **CI/CD optimized** - Parallel execution and efficient reporting

## Quick Start

### Prerequisites
- Node.js 18+
- Git

### Setup
```bash
# Clone repository
git clone <repo-url> visual-regression-tests
cd visual-regression-tests

# Install dependencies
npm ci

# Install browsers
npm run install-browsers

# Copy environment config
cp .env.example .env
# Edit .env with your settings
```

### Running Tests

```bash
# All applications (desktop)
npm test

# Specific application
npm run test:swan
npm run test:toucan
npm run test:flamingo
npm run test:goose

# Mobile viewport testing
npm run test:mobile

# Update visual baselines
npm run test:update

# Interactive mode
npm run test:ui

# View latest report
npm run report
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `TLD` | `staging.env.mpb.com` | Target domain |
| `PROTOCOL` | `https` | HTTP protocol |
| `HEADLESS` | `true` | Headless browser mode |
| `MOBILE_VIEW` | `false` | Use mobile viewport |
| `VISUAL_THRESHOLD` | `0.1` | Visual comparison threshold |
| `WORKERS` | `3` | Parallel test workers |

## Project Structure

```
visual-regression-tests/
├── lib/
│   └── base-tester.js           # Common visual testing utilities
├── tests/
│   ├── swan/
│   │   └── swan.spec.js         # Swan application tests
│   ├── toucan/                  # Toucan application tests
│   ├── flamingo/                # Flamingo application tests
│   ├── goose/                   # Goose application tests
│   └── template.spec.js         # Template for new tests
├── playwright.config.js         # Playwright configuration
├── Jenkinsfile                  # CI/CD pipeline
└── package.json                 # Dependencies and scripts
```

## Adding New Tests

### For Existing Applications
1. Navigate to `tests/{app_name}/`
2. Add new test cases to existing `.spec.js` files
3. Follow existing patterns for consistency

### For New Applications
1. Copy `tests/template.spec.js` to `tests/{app_name}/{app_name}.spec.js`
2. Replace all `APP_NAME` placeholders with your application name
3. Update paths and test scenarios for your application
4. Add npm script to `package.json`: `"test:{app_name}": "playwright test tests/{app_name}"`

### Best Practices
- **Test naming**: Use descriptive names like `app-feature-page.png`
- **Dynamic elements**: Hide timestamps, loaders, and changing content
- **Wait for stability**: Ensure pages are fully loaded before screenshots
- **Mobile testing**: Include mobile viewport tests for responsive designs

## CI/CD Integration

### Jenkins Pipeline
The included Jenkinsfile provides:
- **Environment selection** (staging, production, demo)
- **Parallel execution** (desktop + mobile)
- **Baseline updates** for approved UI changes
- **HTML reporting** with visual diffs
- **Email notifications** on failures

### Pipeline Parameters
- `TLD`: Target environment
- `TEST_SUITE`: Which tests to run (all, swan, toucan, etc.)
- `VISUAL_THRESHOLD`: Comparison sensitivity
- `UPDATE_BASELINES`: Update reference images
- `MOBILE_VIEW`: Run mobile tests

### Integration with Frontend Pipeline
```yaml
# Example: Add to frontend .github/workflows/
- name: Visual Regression Tests
  run: |
    cd visual-regression-tests
    npm ci
    npm run install-browsers
    npm test
```

## Visual Comparison

### How it Works
1. **Baseline Creation**: First run creates reference screenshots
2. **Comparison**: Subsequent runs compare against baselines
3. **Diff Generation**: Failed comparisons generate visual diffs
4. **Threshold Control**: Configure sensitivity via `VISUAL_THRESHOLD`

### Updating Baselines
```bash
# After approved UI changes
npm run test:update

# Or via Jenkins with UPDATE_BASELINES=true
```

### Handling Failures
1. **Review diffs** in `test-results/` or HTML report
2. **Investigate changes** - intentional vs regression
3. **Update baselines** if changes are approved
4. **Fix issues** if changes are regressions

## Authentication

The `BaseVisualTester` includes authentication setup for MPB applications.

**To implement**:
1. Update `authenticatePage()` method in `lib/base-tester.js`
2. Add environment variables for test credentials
3. Integrate with your authentication system

## Performance

### Optimization Features
- **Parallel execution** across multiple workers
- **Efficient browser reuse** with session persistence
- **Fast screenshot comparison** with pixel-level precision
- **Selective test execution** by application or viewport

### CI Performance
- **2-3 minutes** for full suite (all applications, desktop + mobile)
- **30-60 seconds** for single application
- **Automatic retries** for flaky visual comparisons

## Troubleshooting

### Common Issues
1. **Browser installation**: Run `npm run install-browsers`
2. **Permission errors**: Ensure proper file permissions
3. **Network timeouts**: Increase timeout values in config
4. **Visual differences**: Check for dynamic content, animations

### Debug Mode
```bash
# Run with debug output
npm run test:debug

# Run single test with UI
npx playwright test tests/swan/swan.spec.js --debug
```

## Team Integration

### Frontend Team
- **Run on PR**: Catch visual regressions early
- **Update baselines**: Approve intentional UI changes
- **Mobile testing**: Ensure responsive design quality

### QA Team
- **Cross-browser testing**: Validate across browsers
- **Environment testing**: Test on different environments
- **Integration validation**: Verify with backend changes

### DevOps Team
- **Pipeline optimization**: Tune worker counts and timeouts
- **Infrastructure scaling**: Adjust based on test load
- **Reporting integration**: Connect with existing tools

---

**Repository**: Separate from functional tests for optimal performance
**Ownership**: Frontend team with QA collaboration
**Execution**: Frontend pipeline + dedicated Jenkins jobs