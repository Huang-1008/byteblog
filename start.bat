@echo off
chcp 65001 >nul
title ByteBlog - AI 增强博客系统

echo ============================================
echo   ByteBlog - AI 增强的个人博客系统
echo ============================================
echo.

:: 检查 Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未找到 Python，请先安装 Python 3.10+
    pause
    exit /b 1
)

:: 检查 Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未找到 Node.js，请先安装 Node.js 18+
    pause
    exit /b 1
)

:: 检查 MySQL
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [警告] 未找到 MySQL 命令行工具，请确保 MySQL 服务已启动
)

echo [信息] 环境检查通过
echo.

:: 检查后端依赖
if not exist "backend\app" (
    echo [错误] 未找到后端目录，请确保在项目根目录运行此脚本
    pause
    exit /b 1
)

:: 启动后端
echo [启动] 正在启动后端服务 (端口 8000)...
start "ByteBlog-Backend" cmd /c "cd /d %~dp0 && python start_backend.py"
echo [启动] 后端启动中，请稍候...

:: 等待后端启动
timeout /t 3 /nobreak >nul

:: 检查前端依赖
if not exist "frontend\node_modules" (
    echo [安装] 正在安装前端依赖...
    cd /d "%~dp0frontend"
    call npm install
    cd /d "%~dp0"
)

:: 启动前端
echo [启动] 正在启动前端服务 (端口 5173)...
start "ByteBlog-Frontend" cmd /c "cd /d %~dp0frontend && npm run dev"
echo [启动] 前端启动中，请稍候...

timeout /t 5 /nobreak >nul

echo.
echo ============================================
echo   启动完成！
echo   前端: http://localhost:5173
echo   后端: http://localhost:8000
echo   API文档: http://localhost:8000/docs
echo.
echo   管理员账号: admin / admin123
echo ============================================
echo.
echo 按任意键退出此窗口（不影响服务运行）
pause >nul
