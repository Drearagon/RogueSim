@echo off
echo 🔧 Fixing RogueSim Login Error
echo ===============================

echo 🛑 Killing any running Node processes...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im npm.exe >nul 2>&1

echo 🧹 Cleaning up dependencies...
rmdir /s /q node_modules >nul 2>&1
del package-lock.json >nul 2>&1

echo 📦 Reinstalling dependencies...
npm install

echo 🔧 Installing missing jiti dependency...
npm install jiti --save-dev

echo 🔧 Installing postcss dependencies...
npm install postcss autoprefixer tailwindcss --save-dev

echo 🧪 Testing build...
npm run build

echo 🚀 Starting development server...
npm run dev

pause 