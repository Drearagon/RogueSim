#!/bin/bash

echo "🔄 Restarting RogueSim with App Container"
echo "========================================"

# Stop all containers
echo "🛑 Stopping containers..."
docker-compose down

# Remove any orphaned containers  
echo "🧹 Cleaning up..."
docker-compose rm -f

# Rebuild and start everything
echo "🚀 Building and starting all services..."
docker-compose up -d --build

# Wait a moment
sleep 3

echo ""
echo "📊 Container Status:"
docker-compose ps

echo ""
echo "🎯 Check app logs:"
echo "docker-compose logs app -f"

echo ""
echo "🌐 Once running, your app should be available at:"
echo "http://your-server-ip:3000" 