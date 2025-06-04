@echo off
echo 🎮 Simple Local RogueSim Setup
echo ===============================

echo 1️⃣  Cleaning up old processes...
taskkill /F /IM node.exe >nul 2>&1

echo.
echo 2️⃣  Creating simplified environment...
echo NODE_ENV=development > .env
echo DATABASE_URL=sqlite:./local.db >> .env
echo SESSION_SECRET=local-dev-key >> .env

echo.
echo 3️⃣  Installing dependencies (if needed)...
if not exist "node_modules" (
    echo Installing packages...
    npm install
)

echo.
echo 4️⃣  Building the project...
npm run build

echo.
echo 5️⃣  Starting the application...
echo.
echo 📱 Starting RogueSim in production mode...
echo 🌐 Will be available at: http://localhost:3000
echo.

start "RogueSim" cmd /c "npm start"

echo.
echo 6️⃣  Waiting for server to start...
timeout /t 5 /nobreak >nul

echo.
echo 7️⃣  Opening browser...
start http://localhost:3000

echo.
echo ✅ RogueSim is starting!
echo.
echo 📋 If you get login errors:
echo 1. Wait 10-15 seconds for the server to fully start
echo 2. Refresh the page
echo 3. Check the RogueSim terminal window for errors
echo.
echo 🛑 To stop: Close the RogueSim terminal window
echo.
pause 