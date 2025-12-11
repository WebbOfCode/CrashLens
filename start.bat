@echo off
echo Starting CrashLens...
echo.

REM Start Backend
echo [1/2] Starting Backend Server...
start "CrashLens Backend" cmd /k "cd backend && venv\Scripts\activate && python app.py"
timeout /t 3 /nobreak >nul

REM Start Frontend
echo [2/2] Starting Frontend Dev Server...
start "CrashLens Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo CrashLens is starting!
echo ========================================
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo ========================================
echo.
echo Press any key to stop all servers...
pause >nul

REM Kill both servers
taskkill /FI "WINDOWTITLE eq CrashLens Backend*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq CrashLens Frontend*" /F >nul 2>&1
echo All servers stopped.
