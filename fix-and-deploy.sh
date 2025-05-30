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
echo "🔧 Loading server secrets..."
if [ -f "./server-secrets.conf" ]; then
    source ./server-secrets.conf
    echo "✓ Secrets loaded from server-secrets.conf"
else
    echo "❌ ERROR: server-secrets.conf not found!"
    echo "Please create server-secrets.conf from server-secrets.conf.template"
    echo "and fill in your actual API keys and secrets."
    exit 1
fi

echo "🔧 Setting environment variables..."
# Variables are now loaded from server-secrets.conf above

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