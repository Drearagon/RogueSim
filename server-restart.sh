#!/bin/bash

echo "🔄 Restarting RogueSim Services"
echo "==============================="

# Navigate to the right directory
cd /opt/roguesim/RogueSim

echo "1️⃣  Stopping containers..."
docker-compose down

echo ""
echo "2️⃣  Cleaning up Docker (optional)..."
docker system prune -f

echo ""
echo "3️⃣  Starting containers..."
docker-compose up -d

echo ""
echo "4️⃣  Waiting for services to start..."
sleep 10

echo ""
echo "5️⃣  Checking container status..."
docker-compose ps

echo ""
echo "6️⃣  Testing app connection..."
sleep 5
curl -f http://localhost:3000 2>/dev/null && echo "✅ App is responding!" || echo "❌ App still not responding"

echo ""
echo "7️⃣  Restarting nginx..."
systemctl restart nginx

echo ""
echo "8️⃣  Final test..."
curl -I http://localhost 2>/dev/null | head -3

echo ""
echo "✅ Restart complete!"
echo "🌐 Test your domain: http://roguesim.com" 