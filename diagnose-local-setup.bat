@echo off
echo 🔍 Diagnosing Local RogueSim Setup
echo ==================================

echo 1️⃣  Checking what's running on ports...
echo.
echo Port 3000 (Backend API):
netstat -ano | findstr :3000
echo.
echo Port 5173 (Frontend):
netstat -ano | findstr :5173
echo.

echo 2️⃣  Testing if backend is responding...
curl -s http://localhost:3000/api/health || echo ❌ Backend not responding on port 3000
curl -s http://localhost:3000/ || echo ❌ Backend root not responding

echo.
echo 3️⃣  Checking running Node processes...
tasklist | findstr node.exe

echo.
echo 4️⃣  Stopping all Node processes...
taskkill /F /IM node.exe >nul 2>&1

echo.
echo 5️⃣  Checking if PostgreSQL is needed...
if exist "server\db.ts" (
    echo Database detected - checking PostgreSQL...
    netstat -ano | findstr :5432 || echo ⚠️  PostgreSQL not running on port 5432
)

echo.
echo 6️⃣  Starting backend server manually...
echo Starting backend on port 3000...
start "RogueSim Backend" cmd /c "npm run server"

echo.
echo 7️⃣  Waiting for backend to start...
timeout /t 8 /nobreak >nul

echo.
echo 8️⃣  Testing backend again...
echo Testing health endpoint:
curl -s http://localhost:3000/api/health || echo ❌ Still not responding

echo Testing root endpoint:
curl -s http://localhost:3000/ || echo ❌ Root still not responding

echo.
echo 9️⃣  Creating simple test API call...
echo Testing auth endpoint:
curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"test\",\"password\":\"test\"}" || echo ❌ Auth endpoint failed

echo.
echo 🔟  Starting frontend with proxy...
start "RogueSim Frontend" cmd /c "npm run dev"

echo.
echo ✅ Diagnostic complete!
echo.
echo 📋 If backend is still not working:
echo 1. Check the Backend terminal window for errors
echo 2. Try running: npm install (in case dependencies are missing)
echo 3. Check if a database is required and running
echo 4. Look for any .env file requirements
echo.
echo 🌐 Frontend should be at: http://localhost:5173
echo 🔧 Backend should be at: http://localhost:3000
echo.
pause 