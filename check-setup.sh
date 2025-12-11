#!/bin/bash

# CrashLens Setup Checker
# This script helps verify your environment is ready for deployment

echo "================================"
echo "🚦 CrashLens Setup Checker"
echo "================================"
echo ""

# Check if .env exists
if [ -f ".env" ]; then
    echo "✅ .env file found"
    
    # Check for required variables
    if grep -q "HERE_API_KEY=" .env && ! grep -q "HERE_API_KEY=your_here_api_key_here" .env; then
        echo "✅ HERE_API_KEY is set"
    else
        echo "❌ HERE_API_KEY is not set in .env"
        echo "   Get one at: https://developer.here.com/"
    fi
    
    if grep -q "STORAGE_URL=" .env && ! grep -q "STORAGE_URL=https://your-project.supabase.co" .env; then
        echo "✅ STORAGE_URL is set"
    else
        echo "❌ STORAGE_URL is not set in .env"
        echo "   Create a Supabase project at: https://supabase.com/"
    fi
    
    if grep -q "STORAGE_KEY=" .env && ! grep -q "STORAGE_KEY=your_supabase_anon_key" .env; then
        echo "✅ STORAGE_KEY is set"
    else
        echo "❌ STORAGE_KEY is not set in .env"
        echo "   Get it from your Supabase project settings"
    fi
else
    echo "❌ .env file not found"
    echo "   Run: cp .env.example .env"
    echo "   Then edit .env with your API keys"
fi

echo ""
echo "================================"
echo "📦 Checking Dependencies"
echo "================================"
echo ""

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js installed: $NODE_VERSION"
    
    # Check if version is 18+
    MAJOR_VERSION=$(node --version | cut -d'.' -f1 | sed 's/v//')
    if [ "$MAJOR_VERSION" -ge 18 ]; then
        echo "   Version is compatible (18+)"
    else
        echo "   ⚠️  Node.js version should be 18 or higher"
    fi
else
    echo "❌ Node.js not found"
    echo "   Install from: https://nodejs.org/"
fi

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo "✅ Python installed: $PYTHON_VERSION"
else
    echo "❌ Python 3 not found"
    echo "   Install from: https://www.python.org/"
fi

# Check Docker
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo "✅ Docker installed: $DOCKER_VERSION"
else
    echo "⚠️  Docker not found (optional)"
    echo "   Install from: https://www.docker.com/"
fi

# Check git
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    echo "✅ Git installed: $GIT_VERSION"
else
    echo "❌ Git not found"
    echo "   Install from: https://git-scm.com/"
fi

echo ""
echo "================================"
echo "📝 Next Steps"
echo "================================"
echo ""

if [ -f ".env" ]; then
    echo "1. ✅ Environment configured"
else
    echo "1. Copy .env.example to .env and add your API keys"
fi

echo "2. Choose a deployment option:"
echo "   - 🆓 Free Platform: See FREE_PLATFORM_GUIDE.md"
echo "   - 🏠 Local Development: See README.md"
echo "   - 🚀 Production: See DEPLOYMENT.md"
echo ""
echo "3. For free deployment (recommended for beginners):"
echo "   Read: FREE_PLATFORM_GUIDE.md"
echo "   Platforms: Render, Railway, or Vercel"
echo ""

echo "================================"
echo "📚 Documentation"
echo "================================"
echo ""
echo "- FREE_PLATFORM_GUIDE.md - Deploy on 100% free platforms"
echo "- SETUP_GUIDE.md - Detailed setup instructions"
echo "- DEPLOYMENT.md - Advanced deployment options"
echo "- README.md - Full documentation"
echo ""
echo "Need help? Open an issue on GitHub"
echo "================================"
