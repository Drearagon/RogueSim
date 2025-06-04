#!/bin/bash

echo "🌐 RogueSim Cloudflare Configuration"
echo "===================================="

# Change to the project directory
cd /opt/roguesim/RogueSim

echo "📥 Pulling latest changes from repository..."
git pull origin main

echo "🛑 Stopping containers..."
docker-compose down

echo "🔨 Rebuilding with Cloudflare-ready port 80..."
docker-compose build --no-cache app

echo "🚀 Starting all containers on standard HTTP port..."
docker-compose up -d

echo "⏳ Waiting for containers to start..."
sleep 15

echo "📊 Container status:"
docker-compose ps

echo "🧪 Testing connection on port 80..."
if curl -s http://localhost:80 > /dev/null; then
    echo "✅ SUCCESS: Application responding on port 80!"
    echo "🌐 Your app is now Cloudflare-ready at:"
    echo "   • Direct: http://49.13.197.91"
    echo "   • Domain: http://your-domain.com (after DNS setup)"
    echo ""
    echo "🔥 CLOUDFLARE SETUP INSTRUCTIONS:"
    echo "1. Add A record: @ → 49.13.197.91"
    echo "2. Enable proxy (orange cloud)"
    echo "3. Access via your domain!"
else
    echo "❌ Connection test failed. Checking logs..."
    echo ""
    echo "📋 Application logs:"
    docker logs roguesim-app-1 --tail 20
fi

echo ""
echo "🎉 Cloudflare configuration complete!"
echo "📊 Final status:"
docker stats --no-stream | head -4 