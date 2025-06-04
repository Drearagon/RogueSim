#!/bin/bash

echo "🔧 Fixing RogueSim Container Crash"
echo "================================="

cd /opt/roguesim/RogueSim

echo "1️⃣  Checking container logs..."
echo "Last 50 lines from crashing container:"
docker logs --tail 50 roguesim-app-1

echo ""
echo "2️⃣  Stopping all containers..."
docker-compose down

echo ""
echo "3️⃣  Checking if our Dockerfile fix is in place..."
echo "Looking for vite dependency fix..."
grep -n "npm ci" Dockerfile

echo ""
echo "4️⃣  Rebuilding with no cache to ensure clean build..."
docker-compose build --no-cache

echo ""
echo "5️⃣  Starting containers with logs..."
docker-compose up -d

echo ""
echo "6️⃣  Waiting 15 seconds for startup..."
sleep 15

echo ""
echo "7️⃣  Checking if container is stable..."
docker ps | grep roguesim-app

echo ""
echo "8️⃣  Testing port 3000..."
sleep 5
curl -f http://localhost:3000 2>/dev/null && echo "✅ SUCCESS: App is responding!" || echo "❌ Still not working, checking logs again..."

echo ""
echo "9️⃣  If still failing, here are the latest logs:"
docker logs --tail 20 roguesim-app-1

echo ""
echo "🔧 Manual commands if needed:"
echo "View live logs: docker logs -f roguesim-app-1"
echo "Enter container: docker exec -it roguesim-app-1 /bin/bash"
echo "Check files: docker exec roguesim-app-1 ls -la /app" 