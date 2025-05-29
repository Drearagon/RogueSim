@echo off
echo.
echo ========================================
echo    🌐 RogueSim Tunnel Launcher
echo ========================================
echo.

echo 🎯 Attempting to get a custom RogueSim URL...
echo.

REM Try different subdomain variations
echo 📡 Trying roguesim.loca.lt...
start "RogueSim Tunnel" cmd /k "lt --port 3000 --subdomain roguesim || (echo Subdomain taken, trying alternatives... && lt --port 3000 --subdomain roguesim-game || lt --port 3000 --subdomain rogue-sim || lt --port 3000 --subdomain roguesim2025 || lt --port 3000)"

echo.
echo ✅ Tunnel starting in new window!
echo.
echo 🎮 Your RogueSim will be available at one of these URLs:
echo    • https://roguesim.loca.lt (preferred)
echo    • https://roguesim-game.loca.lt
echo    • https://rogue-sim.loca.lt  
echo    • https://roguesim2025.loca.lt
echo    • Or a random URL if all custom names are taken
echo.
echo 🔐 When prompted for IP address, use: 108.160.22.137
echo.
echo 📋 Share message template:
echo "🎮 Join my RogueSim hacker game!"
echo "URL: [paste the HTTPS URL from tunnel window]"
echo "IP when prompted: 108.160.22.137"
echo.
pause 