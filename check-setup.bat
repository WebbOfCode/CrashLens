@echo off
REM CrashLens Setup Checker for Windows
REM This script helps verify your environment is ready for deployment

echo ================================
echo 🚦 CrashLens Setup Checker
echo ================================
echo.

REM Check if .env exists
if exist ".env" (
    echo ✅ .env file found
    
    findstr /C:"HERE_API_KEY=" .env >nul
    if %ERRORLEVEL% EQU 0 (
        echo ✅ HERE_API_KEY is set
    ) else (
        echo ❌ HERE_API_KEY is not set in .env
        echo    Get one at: https://developer.here.com/
    )
    
    findstr /C:"STORAGE_URL=" .env >nul
    if %ERRORLEVEL% EQU 0 (
        echo ✅ STORAGE_URL is set
    ) else (
        echo ❌ STORAGE_URL is not set in .env
        echo    Create a Supabase project at: https://supabase.com/
    )
    
    findstr /C:"STORAGE_KEY=" .env >nul
    if %ERRORLEVEL% EQU 0 (
        echo ✅ STORAGE_KEY is set
    ) else (
        echo ❌ STORAGE_KEY is not set in .env
        echo    Get it from your Supabase project settings
    )
) else (
    echo ❌ .env file not found
    echo    Run: copy .env.example .env
    echo    Then edit .env with your API keys
)

echo.
echo ================================
echo 📦 Checking Dependencies
echo ================================
echo.

REM Check Node.js
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js installed: %NODE_VERSION%
) else (
    echo ❌ Node.js not found
    echo    Install from: https://nodejs.org/
)

REM Check Python
where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
    echo ✅ Python installed: %PYTHON_VERSION%
) else (
    echo ❌ Python not found
    echo    Install from: https://www.python.org/
)

REM Check Docker
where docker >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('docker --version') do set DOCKER_VERSION=%%i
    echo ✅ Docker installed: %DOCKER_VERSION%
) else (
    echo ⚠️  Docker not found (optional)
    echo    Install from: https://www.docker.com/
)

REM Check Git
where git >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('git --version') do set GIT_VERSION=%%i
    echo ✅ Git installed: %GIT_VERSION%
) else (
    echo ❌ Git not found
    echo    Install from: https://git-scm.com/
)

echo.
echo ================================
echo 📝 Next Steps
echo ================================
echo.

if exist ".env" (
    echo 1. ✅ Environment configured
) else (
    echo 1. Copy .env.example to .env and add your API keys
)

echo 2. Choose a deployment option:
echo    - 🆓 Free Platform: See FREE_PLATFORM_GUIDE.md
echo    - 🏠 Local Development: See README.md
echo    - 🚀 Production: See DEPLOYMENT.md
echo.
echo 3. For free deployment (recommended for beginners):
echo    Read: FREE_PLATFORM_GUIDE.md
echo    Platforms: Render, Railway, or Vercel
echo.

echo ================================
echo 📚 Documentation
echo ================================
echo.
echo - FREE_PLATFORM_GUIDE.md - Deploy on 100%% free platforms
echo - SETUP_GUIDE.md - Detailed setup instructions
echo - DEPLOYMENT.md - Advanced deployment options
echo - README.md - Full documentation
echo.
echo Need help? Open an issue on GitHub
echo ================================
echo.
pause
