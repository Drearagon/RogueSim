#!/bin/bash

echo "🔧 RogueSim Server Port Mapping Fix"
echo "==================================="

# Change to the project directory
cd /opt/roguesim/RogueSim

echo "📥 Pulling latest changes from repository..."
git pull origin main

echo "🛑 Stopping containers..."
docker-compose down

echo "🔨 Rebuilding app container with fixed port mapping..."
docker-compose build --no-cache app

echo "🚀 Starting all containers..."
docker-compose up -d

echo "⏳ Waiting for containers to start..."
sleep 15

echo "📊 Container status:"
docker-compose ps

echo "🧪 Testing connection..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ SUCCESS: Application is responding on port 3000!"
    echo "🌐 Your app is now accessible at http://95.217.135.97:3000"
else
    echo "❌ Connection test failed. Checking logs..."
    echo ""
    echo "📋 Application logs:"
    docker logs roguesim-app-1 --tail 20
    echo ""
    echo "🔍 Container details:"
    docker inspect roguesim-app-1 | grep -A 5 "PortBindings"
fi

echo ""
echo "🎉 Deployment complete!"
echo "📊 Final status check:"
docker stats --no-stream | head -4
