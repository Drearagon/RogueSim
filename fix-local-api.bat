@echo off
echo 🔧 Fixing Local API Connection Issues
echo ====================================

REM Check if we're in the RogueSim directory
if not exist "package.json" (
    echo ❌ Run this from the RogueSim project directory
    echo cd C:\Users\Owner\Documents\CursorProjects\AltProjects\RogueSim
    pause
    exit /b 1
)

echo 1️⃣  Stopping existing processes...
taskkill /F /IM node.exe >nul 2>&1

echo.
echo 2️⃣  Creating local development environment...
echo NODE_ENV=development > .env.local
echo DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/roguesim >> .env.local
echo POSTGRES_USER=postgres >> .env.local
echo POSTGRES_PASSWORD=postgres123 >> .env.local
echo POSTGRES_DB=roguesim >> .env.local
echo SESSION_SECRET=local-dev-session-key >> .env.local
echo VITE_API_URL=http://localhost:3000 >> .env.local

echo.
echo 3️⃣  Updating Vite configuration...
(
echo import { defineConfig } from 'vite'
echo import react from '@vitejs/plugin-react'
echo import path from 'path'
echo.
echo export default defineConfig({
echo   plugins: [react()],
echo   resolve: {
echo     alias: {
echo       '@': path.resolve(__dirname, './client/src'^),
echo     },
echo   },
echo   root: './client',
echo   server: {
echo     port: 5173,
echo     host: true,
echo     proxy: {
echo       '/api': {
echo         target: 'http://localhost:3000',
echo         changeOrigin: true,
echo         secure: false
echo       }
echo     }
echo   },
echo   build: {
echo     outDir: '../dist/public',
echo     emptyOutDir: true,
echo   },
echo   publicDir: 'public'
echo }^)
) > vite.config.ts

echo.
echo 4️⃣  Starting backend server...
start "RogueSim Backend" cmd /c "npm run server"

echo.
echo 5️⃣  Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo 6️⃣  Starting frontend development server...
start "RogueSim Frontend" cmd /c "npm run dev"

echo.
echo 7️⃣  Opening browser...
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo ✅ Local development setup complete!
echo.
echo 🌐 Frontend: http://localhost:5173
echo 🔧 Backend API: http://localhost:3000
echo.
echo 📋 If you still get connection errors:
echo 1. Check both terminal windows are running
echo 2. Wait 10-15 seconds for services to fully start
echo 3. Refresh the browser page
echo 4. Check the browser console for errors (F12)
echo.
pause 