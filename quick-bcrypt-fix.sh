#!/bin/bash

echo "🔧 Quick bcrypt Fix & Docker Rebuild"
echo "====================================="

# Stop everything
echo "▶ Stopping containers..."
docker stop roguesim-app 2>/dev/null || true
docker rm roguesim-app 2>/dev/null || true
docker-compose down 2>/dev/null || true

# Clean up old images
echo "▶ Removing old images..."
docker rmi roguesim 2>/dev/null || true

# Fix dependencies
echo "▶ Fixing bcrypt dependencies..."
npm uninstall bcrypt @types/bcrypt
npm install bcryptjs@2.4.3 @types/bcryptjs@2.4.6

# Clear everything
echo "▶ Clearing caches..."
npm cache clean --force
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf dist 2>/dev/null || true

# Rebuild from scratch
echo "▶ Building Docker image (this may take a few minutes)..."
docker build -t roguesim . --no-cache

# Run container
echo "▶ Starting container..."
docker run -d --name roguesim-app -p 3000:3000 -p 5001:5000 roguesim

# Check status
sleep 5
echo "▶ Checking status..."
if docker ps | grep roguesim-app; then
    echo "✅ SUCCESS! RogueSim is running"
    echo "🎮 Access at: http://localhost:3000"
    echo "📋 View logs: docker logs roguesim-app -f"
else
    echo "❌ FAILED - Checking logs:"
    docker logs roguesim-app
fi 