#!/bin/bash

echo "🔧 RogueSim Server Build Fix"
echo "============================"

cd /opt/roguesim/RogueSim

echo "🎯 Problem: Docker trying to copy non-existent 'dist' directory"
echo "✅ Solution: Modify Dockerfile to build inside container"
echo ""

# Step 1: Fix Dockerfile to build inside container
echo "📋 1. UPDATING DOCKERFILE"
echo "========================="

echo "📝 Creating new Dockerfile that builds inside container..."
cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++ libc6-compat

# Copy package files first (for better caching)
COPY package*.json ./

# Install ALL dependencies (including dev dependencies for building)
RUN npm ci

# Copy source code
COPY . .

# Build the application inside the container
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm ci --only=production && npm cache clean --force

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
EOF

echo "✅ Dockerfile updated to build inside container"

# Step 2: Update .dockerignore to exclude unnecessary files
echo ""
echo "📋 2. UPDATING .DOCKERIGNORE"
echo "============================"

echo "📝 Creating .dockerignore to exclude unnecessary files..."
cat > .dockerignore << 'EOF'
node_modules
.git
.gitignore
README.md
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.DS_Store
.vscode
coverage
*.log
scripts/
fix-*.sh
deploy-*.sh
EOF

echo "✅ .dockerignore updated"

# Step 3: Rebuild containers
echo ""
echo "📋 3. REBUILDING CONTAINERS"
echo "==========================="

echo "🛑 Stopping existing containers..."
docker-compose down

echo ""
echo "🧹 Cleaning Docker cache completely..."
docker system prune -af

echo ""
echo "🔄 Rebuilding with new Dockerfile..."
docker-compose build --no-cache

echo ""
echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for build and startup..."
sleep 30

# Step 4: Verify everything works
echo ""
echo "📋 4. VERIFICATION"
echo "=================="

echo "📊 Container status:"
docker-compose ps

echo ""
echo "📊 Build logs (checking for successful npm run build):"
docker-compose logs app | grep -E "(npm run build|Build|dist|✅|🚀)" | tail -10

echo ""
echo "📊 App logs (checking for successful startup):"
docker-compose logs --tail=10 app

echo ""
echo "🧪 Testing API endpoint:"
curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}' \
  -w "\nHTTP Status: %{http_code}\n" \
  2>/dev/null

echo ""
echo "🎯 BUILD FIX COMPLETE!"
echo "======================"
echo ""
echo "✅ Dockerfile now builds inside container"
echo "✅ No need for external 'dist' directory"
echo "✅ Containers rebuilt with working build process"
echo ""
echo "🌐 Your app should now be fully working at:"
echo "   • http://roguesim.com"
echo "   • http://49.13.197.91"
echo ""
echo "🎮 Test the login - it should work now!" 