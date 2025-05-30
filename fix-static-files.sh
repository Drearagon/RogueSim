#!/bin/bash

echo "🔧 Fixing Static File Serving Issue"
echo "==================================="

cd /opt/roguesim/RogueSim

echo "1️⃣  Stopping containers..."
docker-compose down

echo ""
echo "2️⃣  Checking current file structure..."
echo "Looking for dist directory..."
ls -la dist/ 2>/dev/null || echo "No dist directory found"

echo ""
echo "3️⃣  Rebuilding application with fixed static serving..."
docker-compose build --no-cache app

echo ""
echo "4️⃣  Starting containers..."
docker-compose up -d

echo ""
echo "5️⃣  Waiting for startup..."
sleep 10

echo ""
echo "6️⃣  Checking container status..."
docker ps | grep roguesim-app

echo ""
echo "7️⃣  Checking logs for static file discovery..."
echo "Looking for 'Found client build at' message..."
docker logs --tail 30 roguesim-app-1 | grep -E "(Found client build|Could not find|BUILD ERROR)" || echo "No build messages found yet"

echo ""
echo "8️⃣  Testing application response..."
sleep 5
echo "Testing localhost:3000..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$response" = "200" ]; then
    echo "✅ SUCCESS! Application responding with HTTP 200"
    echo "🌐 Your domain should now work: http://roguesim.com"
elif [ "$response" = "500" ]; then
    echo "⚠️  Getting HTTP 500 - check if it's the build error page"
    echo "Fetching error page..."
    curl -s http://localhost:3000 | grep -o '<h1>.*</h1>' || echo "Could not get error details"
else
    echo "❌ Still getting HTTP $response"
fi

echo ""
echo "9️⃣  Full container logs (last 20 lines):"
docker logs --tail 20 roguesim-app-1

echo ""
echo "🔧 Next steps if still not working:"
echo "1. Check logs: docker logs -f roguesim-app-1"
echo "2. Enter container: docker exec -it roguesim-app-1 /bin/bash"
echo "3. Check build: docker exec roguesim-app-1 find /app -name 'index.html'"
echo "4. Manual test: curl -v http://localhost:3000" 