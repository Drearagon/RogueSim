@echo off
echo.
echo ========================================
echo    🚀 RogueSim Quick Start
echo ========================================
echo.

REM Check if ngrok is installed
where ngrok >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 📦 Installing ngrok...
    npm install -g ngrok
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Failed to install ngrok automatically.
        echo 📖 Please install manually from: https://ngrok.com/download
        echo 📖 Or try: winget install ngrok
        pause
        exit /b 1
    )
)

echo ✅ ngrok is ready
echo.

echo Choose how to share your RogueSim:
echo.
echo 1. 🎮 Simple Demo (no password - for testing)
echo 2. 🔒 Secure Access (with password protection)
echo 3. 🏠 Local Network Only (LAN access)
echo.
set /p choice="Enter choice (1-3): "

if "%choice%"=="1" goto simple
if "%choice%"=="2" goto secure
if "%choice%"=="3" goto local

echo Invalid choice. Using Simple Demo.

:simple
echo.
echo 🎮 Starting Simple Demo Mode...
echo ⚠️  No password protection - for quick testing only!
echo.
start "RogueSim" cmd /k "npm run dev"
echo 📡 Waiting for RogueSim to start...
ping -n 6 127.0.0.1 > nul
echo 🌐 Creating public tunnel...
start "Public Tunnel" cmd /k "ngrok http 3000"
echo.
echo 🎯 Look for the HTTPS URL in the ngrok window!
echo 📱 Share that URL with friends
echo ⚠️  Anyone with the URL can access your server
goto end

:secure
echo.
echo 🔒 Secure Mode Setup...
echo.
echo Creating ngrok config file for authentication...

REM Create a temporary ngrok config
echo version: "2" > ngrok_temp.yml
echo authtoken: "" >> ngrok_temp.yml
echo tunnels: >> ngrok_temp.yml
echo   roguesim: >> ngrok_temp.yml
echo     addr: 3000 >> ngrok_temp.yml
echo     proto: http >> ngrok_temp.yml
echo     auth: "player:secure123" >> ngrok_temp.yml

echo.
echo 🎮 Starting RogueSim...
start "RogueSim" cmd /k "npm run dev"
echo 📡 Waiting for RogueSim to start...
ping -n 6 127.0.0.1 > nul
echo 🔒 Creating secure tunnel...
start "Secure Tunnel" cmd /k "ngrok start --config=ngrok_temp.yml roguesim"
echo.
echo 🎯 Look for the HTTPS URL in the ngrok window!
echo 🔑 Share these credentials:
echo    Username: player
echo    Password: secure123
echo.
echo 📱 Example share message:
echo    "Join my RogueSim! URL: [paste ngrok HTTPS URL]"
echo    "Login: player / secure123"
goto end

:local
echo.
echo 🏠 Local Network Mode...
echo ⚠️  Only accessible on your local network (WiFi/LAN)
echo.
start "RogueSim Local" cmd /k "npm run dev -- --host 0.0.0.0"
echo.
echo 🌐 RogueSim will be accessible at:
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4"') do (
    set ip=%%i
    set ip=!ip: =!
    echo     http://!ip!:3000
)
setlocal enabledelayedexpansion
echo.
echo 📱 Share one of these URLs with people on your network
goto end

:end
echo.
echo ========================================
echo    ✅ Setup Complete!
echo ========================================
echo.
echo 📋 What's running:
echo    • RogueSim game server
echo    • Remote access tunnel (if chosen)
echo.
echo 🛑 To stop everything:
echo    • Close the terminal windows, or
echo    • Press Ctrl+C in each terminal
echo.
echo 🎮 Game Commands:
echo    • Type "help" for available commands
echo    • Type "tutorial" for guided learning
echo    • Type "scan wifi" to start hacking
echo.

REM Clean up temp files
if exist ngrok_temp.yml del ngrok_temp.yml

pause 