#!/bin/bash

# MPB Visual Regression Tests - Setup Script

set -e

echo "🎭 Setting up MPB Visual Regression Tests..."

# Check Node.js version
echo "📋 Checking Node.js version..."
node_version=$(node -v | cut -d'v' -f2)
required_version="18.0.0"

if [ "$(printf '%s\n' "$required_version" "$node_version" | sort -V | head -n1)" = "$required_version" ]; then
    echo "✅ Node.js $node_version is compatible"
else
    echo "❌ Node.js $node_version is not supported. Please install Node.js 18 or higher"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Install Playwright browsers
echo "🌐 Installing Playwright browsers..."
npx playwright install chromium

# Install system dependencies (if needed)
echo "🔧 Installing system dependencies..."
npx playwright install-deps chromium

# Copy environment file
if [ ! -f .env ]; then
    echo "📝 Creating environment configuration..."
    cp .env.example .env
    echo "✅ Created .env file - please configure your settings"
else
    echo "✅ Environment file already exists"
fi

# Create test results directory
mkdir -p test-results

# Run a quick test to verify setup
echo "🧪 Running setup verification test..."
TLD=staging.env.mpb.com HEADLESS=true npx playwright test tests/template.spec.js --grep="login page" --project="Desktop Chrome" || {
    echo "⚠️  Test verification failed - this is normal if applications are not accessible"
}

echo ""
echo "🎉 Setup complete! 🎉"
echo ""
echo "Next steps:"
echo "1. Configure your .env file with appropriate settings"
echo "2. Update authentication in lib/base-tester.js if needed"
echo "3. Run tests with: npm test"
echo "4. View reports with: npm run report"
echo ""
echo "Available commands:"
echo "  npm test              - Run all tests"
echo "  npm run test:swan     - Run Swan tests only"
echo "  npm run test:mobile   - Run mobile viewport tests"
echo "  npm run test:ui       - Interactive test runner"
echo "  npm run test:update   - Update visual baselines"
echo ""