@echo off
echo.
echo ========================================
echo    🚀 RogueSim Simple Start
echo ========================================
echo.

REM Kill any existing processes first
echo 🛑 Cleaning up existing processes...
taskkill /f /im node.exe 2>nul
taskkill /f /im ngrok.exe 2>nul
echo.

echo Choose your option:
echo.
echo 1. 🎮 Start Game + Custom Tunnel (roguesim.loca.lt)
echo 2. 🏠 Local Network Only
echo 3. 🎮 Game Only (you handle tunnel manually)
echo.
set /p choice="Enter choice (1-3): "

if "%choice%"=="1" goto game_and_tunnel
if "%choice%"=="2" goto local_only
if "%choice%"=="3" goto game_only

echo Invalid choice. Starting game only.

:game_and_tunnel
echo.
echo 🎮 Starting RogueSim...
start "RogueSim" cmd /k "cd /d %~dp0.. && npm run dev"
echo.
echo 📡 Waiting 8 seconds for game to start...
ping -n 9 127.0.0.1 > nul
echo.
echo 🌐 Creating custom tunnel (trying roguesim.loca.lt)...
start "RogueSim Tunnel" cmd /k "cd /d %~dp0.. && (lt --port 3000 --subdomain roguesim || lt --port 3000 --subdomain roguesim-game || lt --port 3000 --subdomain rogue-sim || lt --port 3000 --subdomain roguesim2025 || lt --port 3000)"
echo.
echo 🎯 Look for the HTTPS URL in the tunnel window!
echo 📱 Preferred URL: https://roguesim.loca.lt
echo 🔐 IP when prompted: 108.160.22.137
echo ⚠️  If custom subdomain is taken, you'll get a random URL
goto end

:local_only
echo.
echo 🏠 Starting RogueSim on local network...
start "RogueSim Local" cmd /k "cd /d %~dp0.. && npm run dev -- --host 0.0.0.0"
echo.
echo 🌐 Finding your local IP addresses...
echo.
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4"') do (
    set ip=%%i
    setlocal enabledelayedexpansion
    set ip=!ip: =!
    echo     📱 Share: http://!ip!:3000
    endlocal
)
echo.
echo 📍 Share one of these URLs with people on your network
goto end

:game_only
echo.
echo 🎮 Starting RogueSim (local only)...
start "RogueSim" cmd /k "cd /d %~dp0.. && npm run dev"
echo.
echo 🌐 Game will be available at: http://localhost:3000
echo.
echo 📋 To add remote access later:
echo    1. Open another terminal
echo    2. Run: lt --port 3000 --subdomain roguesim
echo    3. Share the HTTPS URL
goto end

:end
echo.
echo ========================================
echo    ✅ Setup Complete!
echo ========================================
echo.
echo 🎮 Your RogueSim is starting up!
echo.
echo 🛑 To stop everything:
echo    • Close the terminal windows, or
echo    • Press Ctrl+C in each terminal
echo.
echo 💡 Game Commands to try:
echo    • help - see all commands
echo    • scan wifi - find networks  
echo    • inject payload - start hacking
echo    • tutorial - guided walkthrough
echo.
pause 