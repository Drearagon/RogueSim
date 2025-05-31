#!/bin/bash

echo "🚀 NUCLEAR BCRYPT FIX - Complete System Reset"
echo "=============================================="

# Stop and remove EVERYTHING Docker-related
echo "🧹 COMPLETE DOCKER CLEANUP..."
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true
docker rmi $(docker images -q) 2>/dev/null || true
docker system prune -af --volumes
echo "✅ Docker completely cleaned"

# Remove ALL build artifacts and caches
echo "🧹 REMOVING ALL BUILD ARTIFACTS..."
rm -rf dist/
rm -rf node_modules/
rm -rf .npm/
rm -rf ~/.npm/
rm -rf package-lock.json
echo "✅ Build artifacts removed"

# Verify bcryptjs is in package.json
echo "🔧 VERIFYING PACKAGE.JSON..."
if grep -q '"bcryptjs"' package.json; then
    echo "✅ bcryptjs found in package.json"
else
    echo "❌ bcryptjs NOT found - fixing..."
    sed -i 's/"bcrypt":.*/"bcryptjs": "^2.4.3",/' package.json
    sed -i 's/"@types\/bcrypt":.*/"@types\/bcryptjs": "^2.4.6",/' package.json
fi

# Fresh install
echo "📦 FRESH NPM INSTALL..."
npm cache clean --force
npm install --no-cache
echo "✅ Fresh dependencies installed"

# Build locally first to check for errors
echo "🔨 LOCAL BUILD TEST..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ LOCAL BUILD FAILED - Check the output above"
    exit 1
fi
echo "✅ Local build successful"

# Build Docker with completely fresh environment
echo "🐳 DOCKER BUILD (NO CACHE)..."
docker build -t roguesim . --no-cache --pull
if [ $? -ne 0 ]; then
    echo "❌ DOCKER BUILD FAILED"
    exit 1
fi
echo "✅ Docker build successful"

# Run container
echo "🚀 STARTING CONTAINER..."
docker run -d --name roguesim-fresh -p 3000:3000 -p 5001:5000 roguesim

# Wait and check
sleep 8
echo "🔍 CHECKING CONTAINER STATUS..."

if docker ps | grep roguesim-fresh; then
    echo ""
    echo "🎉 SUCCESS! Container is running!"
    echo "🎮 Access game at: http://localhost:3000"
    echo ""
    echo "📋 Recent logs:"
    docker logs roguesim-fresh --tail 15
else
    echo ""
    echo "❌ Container failed to start. Full logs:"
    docker logs roguesim-fresh
    echo ""
    echo "🔧 Debugging info:"
    echo "Container status:"
    docker ps -a | grep roguesim-fresh
fi

echo ""
echo "🔧 Useful commands:"
echo "  View logs: docker logs roguesim-fresh -f"
echo "  Stop container: docker stop roguesim-fresh"
echo "  Remove container: docker rm roguesim-fresh" 