#!/bin/bash

echo "🔧 RogueSim Port Conflict Resolution"
echo "==================================="

cd /opt/roguesim/RogueSim

echo "🔍 Checking what's using port 80..."
netstat -tlnp | grep :80 || echo "No services found on port 80"

echo ""
echo "🛑 Stopping any conflicting services..."
# Stop common web services that might use port 80
systemctl stop apache2 2>/dev/null || echo "Apache2 not running"
systemctl stop nginx 2>/dev/null || echo "Nginx not running"
systemctl stop lighttpd 2>/dev/null || echo "Lighttpd not running"

echo ""
echo "🛑 Stopping current containers..."
docker-compose down

echo ""
echo "🔧 Updating to use Cloudflare-compatible port 8080..."
# Update docker-compose.yml to use port 8080 instead of 80
sed -i 's/"80:5000"/"8080:5000"/g' docker-compose.yml

echo "📥 Pulling latest changes..."
git pull origin main

echo "🔨 Rebuilding containers..."
docker-compose build --no-cache app

echo "🚀 Starting containers on port 8080..."
docker-compose up -d

echo "⏳ Waiting for containers to start..."
sleep 15

echo "📊 Container status:"
docker-compose ps

echo ""
echo "🧪 Testing connection on port 8080..."
if curl -s http://localhost:8080 > /dev/null; then
    echo "✅ SUCCESS: Application responding on port 8080!"
    echo ""
    echo "🌐 Your app is now accessible at:"
    echo "   • Direct: http://49.13.197.91:8080"
    echo "   • Via Cloudflare: Setup DNS with port 8080"
    echo ""
    echo "🔥 CLOUDFLARE SETUP:"
    echo "1. Add A record: @ → 49.13.197.91"
    echo "2. Add SRV record if needed for port 8080"
    echo "3. Or use Cloudflare's flexible SSL on 8080"
    echo "4. Enable proxy (orange cloud)"
    echo ""
    echo "📌 Alternative: Use Cloudflare tunnel for clean URLs"
else
    echo "❌ Still having issues. Checking logs..."
    echo ""
    echo "📋 Application logs:"
    docker logs roguesim-app-1 --tail 20
    echo ""
    echo "🔍 Port usage:"
    netstat -tlnp | grep -E ':(80|8080|443)' 
fi

echo ""
echo "✅ Port conflict resolution complete!"
echo "📊 Final status:"
docker stats --no-stream | head -4 