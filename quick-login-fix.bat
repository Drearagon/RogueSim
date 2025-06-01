@echo off
echo 🚀 Quick Login Fix for RogueSim
echo ===============================

echo 🛑 Stopping any running processes...
taskkill /f /im node.exe >nul 2>&1

echo 🔧 Installing missing dependencies...
npm install jiti postcss-load-config --save-dev

echo 🔧 Fixing postcss config...
echo module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } } > postcss.config.cjs

echo 🚀 Restarting development server...
timeout /t 3 /nobreak >nul
npm run dev 