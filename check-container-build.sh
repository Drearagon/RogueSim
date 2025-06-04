#!/bin/bash

echo "🔍 Checking Container Contents and Fixing"
echo "========================================"

cd /opt/roguesim/RogueSim

echo "1️⃣  Checking what files are in the container..."
docker exec roguesim-app-1 find /app -name "*.html" -o -name "vite.ts" -o -name "index.js" | head -10

echo ""
echo "2️⃣  Checking the current serveStatic function in built code..."
docker exec roguesim-app-1 grep -A 10 "serveStatic" /app/dist/index.js | head -15

echo ""
echo "3️⃣  Checking server/vite.ts source file..."
echo "Current content:"
grep -A 20 "export function serveStatic" server/vite.ts | head -25

echo ""
echo "4️⃣  Let's check what dist/public directory structure should be..."
docker exec roguesim-app-1 find /app -type d -name "*dist*" -o -name "*public*" -o -name "*build*" | head -10

echo ""
echo "5️⃣  Check what index.html files exist..."
docker exec roguesim-app-1 find /app -name "index.html" -exec ls -la {} \; 2>/dev/null

echo ""
echo "6️⃣  Check what's in /app/dist..."
docker exec roguesim-app-1 ls -la /app/dist/ 2>/dev/null || echo "No /app/dist directory"

echo ""
echo "7️⃣  Check what's in root directory..."
docker exec roguesim-app-1 ls -la /app/ | head -20

echo ""
echo "🔧 Based on findings, we'll create a targeted fix..." 