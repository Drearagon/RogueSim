@echo off
echo.
echo ========================================
echo    📊 RogueSim Status Check
echo ========================================
echo.

echo 🎮 Checking RogueSim servers...
netstat -ano | findstr ":3000" >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Client Server (Port 3000): RUNNING
) else (
    echo ❌ Client Server (Port 3000): NOT RUNNING
)

netstat -ano | findstr ":5000" >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Backend Server (Port 5000): RUNNING
) else (
    echo ❌ Backend Server (Port 5000): NOT RUNNING
)

echo.
echo 🌐 Network Access URLs:
echo.
echo 📍 Local Access:
echo    http://localhost:3000
echo.
echo 📍 Network Access (share with others on your WiFi):
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4"') do (
    set ip=%%i
    setlocal enabledelayedexpansion
    set ip=!ip: =!
    echo    http://!ip!:3000
    endlocal
)

echo.
echo 🔍 Running Processes:
echo.
tasklist | findstr /i "node.exe" 2>nul && echo ✅ Node.js processes found || echo ❌ No Node.js processes
tasklist | findstr /i "ngrok.exe" 2>nul && echo ✅ Ngrok tunnel active || echo ⚠️  No ngrok tunnel
echo.

echo 💡 Quick Actions:
echo    • To start RogueSim: npm run dev
echo    • To create tunnel: lt --port 3000
echo    • To stop all: Ctrl+C in terminal windows
echo.
pause 