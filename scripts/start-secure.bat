@echo off
echo.
echo ========================================
echo    🔒 RogueSim Secure Access Setup
echo ========================================
echo.

REM Check if ngrok is installed
where ngrok >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ngrok not found. Installing...
    npm install -g ngrok
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Failed to install ngrok. Please install manually.
        pause
        exit /b 1
    )
)

echo ✅ ngrok is available
echo.

REM Get ngrok version to check auth syntax
echo 🔍 Checking ngrok version...
ngrok version
echo.

REM Get user choice
echo Choose your secure access method:
echo.
echo 1. 🚀 Quick Demo (ngrok with basic auth)
echo 2. 🔒 Secure Access (ngrok with password)
echo 3. 🎮 Development Mode (local network access)
echo 4. 🏭 Production Build (optimized)
echo.
set /p choice="Enter choice (1-4): "

if "%choice%"=="1" goto demo
if "%choice%"=="2" goto secure
if "%choice%"=="3" goto dev
if "%choice%"=="4" goto prod

echo Invalid choice. Defaulting to Quick Demo.

:demo
echo.
echo 🚀 Starting Quick Demo Mode...
echo ✅ Password: demo123
echo ✅ Username: player
echo.
start "RogueSim" cmd /k "npm run dev"
ping -n 6 127.0.0.1 > nul
start "Ngrok Tunnel" cmd /k "ngrok http 3000 --basic-auth=player:demo123"
echo.
echo 🎯 Share the HTTPS URL that appears in the ngrok window!
echo 🔑 Login credentials: player / demo123
goto end

:secure
echo.
set /p username="Enter username for access: "
set /p password="Enter password for access: "
echo.
echo 🔒 Starting Secure Mode...
echo ✅ Username: %username%
echo ✅ Password: %password%
echo.
start "RogueSim" cmd /k "npm run dev"
ping -n 6 127.0.0.1 > nul
start "Secure Tunnel" cmd /k "ngrok http 3000 --basic-auth=%username%:%password%"
echo.
echo 🎯 Share the HTTPS URL that appears in the ngrok window!
echo 🔑 Login credentials: %username% / %password%
goto end

:dev
echo.
echo 🎮 Starting Development Mode (Local Network)...
echo ⚠️  WARNING: No password protection!
echo ℹ️  Only use on trusted networks
echo.
start "RogueSim Dev" cmd /k "npm run dev -- --host 0.0.0.0"
echo.
echo 🌐 Access via your local IP address:
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4"') do echo     http://%%i:3000
goto end

:prod
echo.
echo 🏭 Building Production Version...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)
echo ✅ Build complete!
echo.
set /p username="Enter username for production access: "
set /p password="Enter password for production access: "
echo.
start "RogueSim Production" cmd /k "npm start"
ping -n 4 127.0.0.1 > nul
start "Production Tunnel" cmd /k "ngrok http 5000 --basic-auth=%username%:%password%"
echo.
echo 🎯 Share the HTTPS URL from the ngrok window!
echo 🔑 Login credentials: %username% / %password%

:end
echo.
echo ========================================
echo    ✅ Secure Access Setup Complete!
echo ========================================
echo.
echo 📋 What to do next:
echo    1. Wait for ngrok to show the HTTPS URL
echo    2. Share the HTTPS URL (never the HTTP one)
echo    3. Provide login credentials to users
echo    4. Monitor access in the terminal windows
echo.
echo ⚠️  Important Security Notes:
echo    • Always use HTTPS URLs only
echo    • Keep login credentials private
echo    • Monitor terminal for suspicious activity
echo    • Close tunnels when done (Ctrl+C)
echo.
echo 💡 If ngrok auth still fails, try these alternatives:
echo    • ngrok http 3000 --auth username:password
echo    • ngrok http 3000 (then manually add auth in ngrok dashboard)
echo    • Use option 3 for local network access instead
echo.
pause 