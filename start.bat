@echo off
title ByteBlog - AI Blog System

echo ============================================
echo   ByteBlog - AI Powered Blog System
echo ============================================
echo.

python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found. Please install Python 3.10+
    pause
    exit /b 1
)

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Please install Node.js 18+
    pause
    exit /b 1
)

echo [INFO] Environment check passed
echo.

if not exist "backend\app" (
    echo [ERROR] Backend folder not found. Run this script from project root.
    pause
    exit /b 1
)

echo [START] Starting backend on port 8000...
start "ByteBlog-Backend" cmd /c "cd /d %~dp0 && python start_backend.py"
echo [START] Backend starting, please wait...

timeout /t 4 /nobreak >nul

if not exist "frontend\node_modules" (
    echo [INSTALL] Installing frontend dependencies...
    cd /d "%~dp0frontend"
    call npm install
    cd /d "%~dp0"
    echo [INSTALL] Frontend dependencies installed.
)

echo [START] Starting frontend on port 5173...
start "ByteBlog-Frontend" cmd /c "cd /d %~dp0frontend && npm run dev"

timeout /t 5 /nobreak >nul

echo.
echo ============================================
echo   Startup Complete!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo.
echo   Admin: admin / admin123
echo ============================================
echo.
echo Press any key to close this window (services keep running)
pause >nul
