@echo off
chcp 65001 >nul
title 海河六域后端服务

echo ==========================================
echo 海河六域后端服务启动脚本
echo ==========================================
echo.
echo [1/2] 检查 Python 环境...
python --version
if errorlevel 1 (
    echo 未检测到 Python，请先安装 Python 并加入 PATH。
    pause
    exit /b 1
)

echo.
echo [2/2] 启动 Flask 后端...
echo 服务地址: http://127.0.0.1:5001
echo 前端首页: http://127.0.0.1:5001/frontend/pages/index.html
echo.

cd /d "%~dp0backend"
python app.py
pause
