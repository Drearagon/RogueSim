#!/bin/bash

echo "🔧 RogueSim Docker Build Dependencies Fix"
echo "========================================"

cd /opt/roguesim/RogueSim

echo "🎯 Problem: Build needs dev dependencies but npm ci only installs production"
echo "✅ Solution: Install all deps, build, then remove dev deps"
echo ""

# Fix Dockerfile to properly handle build dependencies
echo "📋 UPDATING DOCKERFILE"
echo "======================"

echo "📝 Creating corrected Dockerfile..."
cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Install system dependencies needed for native modules
RUN apk add --no-cache python3 make g++ libc6-compat

# Copy package files first (for better Docker layer caching)
COPY package*.json ./

# Install ALL dependencies (including dev dependencies needed for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application (this needs dev dependencies)
RUN npm run build

# Now remove dev dependencies to reduce final image size
RUN npm prune --production && npm cache clean --force

# Expose the port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
EOF

echo "✅ Dockerfile updated with proper dependency handling"

echo ""
echo "🛑 Stopping containers..."
docker-compose down

echo ""
echo "🧹 Cleaning all Docker artifacts..."
docker system prune -af
docker builder prune -af

echo ""
echo "🔄 Rebuilding with corrected Dockerfile..."
docker-compose build --no-cache

echo ""
echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for build and startup..."
sleep 35

echo ""
echo "📊 Container status:"
docker-compose ps

echo ""
echo "📊 Build verification (checking for successful build):"
docker-compose logs app | grep -E "(npm run build|Build complete|dist|✅)" | tail -5

echo ""
echo "📊 Current app logs:"
docker-compose logs --tail=15 app

echo ""
echo "🧪 Testing login endpoint:"
curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}' \
  -w "\nHTTP Status: %{http_code}\n" \
  2>/dev/null

echo ""
echo "🎯 DEPENDENCY FIX COMPLETE!"
echo "==========================="
echo ""
echo "✅ Dev dependencies available during build"
echo "✅ Production-only dependencies in final image"
echo "✅ Build process should work correctly now"
echo ""
echo "🌐 Test your app at:"
echo "   • http://roguesim.com"
echo "   • http://49.13.197.91" 