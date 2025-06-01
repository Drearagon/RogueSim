#!/bin/bash

echo "🔍 Diagnosing RogueSim Docker Container Build..."
echo "================================================="

# Check if docker-compose is running
echo "1. Checking running containers..."
docker ps | grep roguesim

echo ""
echo "2. Examining container file structure..."
docker exec roguesim-app-1 ls -la /app/

echo ""
echo "3. Checking dist directory..."
docker exec roguesim-app-1 ls -la /app/dist/ 2>/dev/null || echo "❌ No /app/dist directory found"

echo ""
echo "4. Checking dist/public directory..."
docker exec roguesim-app-1 ls -la /app/dist/public/ 2>/dev/null || echo "❌ No /app/dist/public directory found"

echo ""
echo "5. Finding all index.html files..."
docker exec roguesim-app-1 find /app -name "index.html" -type f 2>/dev/null || echo "❌ No index.html files found"

echo ""
echo "6. Checking serveStatic logs from container..."
echo "   (Look for ✅ Found client build at: or ❌ Could not find client build directory)"
docker logs roguesim-app-1 | tail -20

echo ""
echo "7. Testing container web response..."
docker exec roguesim-app-1 wget -O- http://localhost:5000 2>/dev/null | head -5 || echo "❌ No response from container"

echo ""
echo "🏁 Diagnosis complete! Key things to look for:"
echo "   ✅ dist/public/index.html should exist"
echo "   ✅ serveStatic should find the client build"
echo "   ✅ Container should respond with HTML content" 