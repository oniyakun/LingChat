@echo off
:: 设置控制台代码页为UTF-8，解决中文显示问题
chcp 65001 > nul

echo.
echo. =================================
echo. Starting LingChat services...
echo. =================================
echo.

:: 设置标题
title LingChat一键启动服务

:: 创建临时文件夹（如果不存在）
if not exist "temp" mkdir temp

:: 启动前端服务
echo. Starting frontend service...
start cmd /k "chcp 65001 > nul && title LingChat前端服务 && cd frontend && node server.js"
echo. Frontend service starting, please wait...
timeout /t 3 > nul

:: 启动后端服务
echo. Starting backend service...
start cmd /k "chcp 65001 > nul && title LingChat后端服务 && cd backend && python webChat.py"
echo. Backend service starting, please wait...
timeout /t 3 > nul

:: 启动VITS语音服务
echo. Starting VITS voice service...
start cmd /k "chcp 65001 > nul && title LingChat语音服务 && cd vits && call start.bat"
echo. Voice service starting, please wait...

echo.
echo. =================================
echo. All services started!
echo. Frontend: http://127.0.0.1:3000
echo. Please keep this window open to maintain services
echo. =================================
echo.

:: 等待所有服务完全启动
echo. Opening browser...
timeout /t 2 > nul

:: 自动打开浏览器访问前端页面
start http://127.0.0.1:3000

echo. Press any key to close this launcher (services will continue running)
pause > nul 