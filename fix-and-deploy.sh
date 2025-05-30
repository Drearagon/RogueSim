#!/bin/bash

echo "🔧 Fixing Vite Issue and Redeploying"
echo "=================================="

# Stop current containers
echo "🛑 Stopping current containers..."
docker-compose down

# Remove the problematic app container and image
echo "🧹 Cleaning up app container and image..."
docker rm -f roguesim-app-1 2>/dev/null || true
docker rmi roguesim-app 2>/dev/null || true
docker system prune -f

# Set environment variables
echo "🔧 Setting environment variables..."
export DB_PASSWORD="nZrdLEehQFVTZ9ogVZXxmfpKOe68thkQTtwuVXaokQM="
export SESSION_SECRET="your-super-secret-session-key-here"
export SENDGRID_API_KEY="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"
export PGADMIN_PASSWORD="roguesim123"

# Use the fixed compose file
echo "🔄 Using fixed docker-compose configuration..."
cp docker-compose-fixed.yml docker-compose.yml

# Rebuild everything from scratch
echo "🔨 Rebuilding all containers from scratch..."
docker-compose build --no-cache

# Start the containers
echo "🚀 Starting containers..."
docker-compose up -d

# Wait a moment for startup
sleep 5

echo ""
echo "📊 Container Status:"
docker-compose ps

echo ""
echo "🎯 Check app logs:"
echo "docker-compose logs app -f"

echo ""
echo "🌐 Access points:"
echo "• RogueSim: http://your-server-ip:3000"
echo "• pgAdmin: http://your-server-ip:8080 (uplink@roguesim.com / roguesim123)" 