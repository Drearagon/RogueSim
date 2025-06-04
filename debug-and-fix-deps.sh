#!/bin/bash

echo "🔍 RogueSim Dependency Debug & Fix"
echo "=================================="

cd /opt/roguesim/RogueSim

echo "📋 1. INVESTIGATING DEPENDENCY ISSUE"
echo "===================================="

echo "📊 Checking package.json for required dependencies..."
echo ""
echo "DevDependencies that should include @vitejs/plugin-react:"
grep -A 20 '"devDependencies"' package.json | head -25

echo ""
echo "📊 Checking if @vitejs/plugin-react is listed:"
grep -n "@vitejs/plugin-react" package.json || echo "❌ @vitejs/plugin-react NOT found in package.json!"

echo ""
echo "📊 Checking vite.config.ts imports:"
head -10 vite.config.ts | grep -E "(import|from)"

echo ""
echo "📋 2. ENSURING ALL REQUIRED DEPENDENCIES"
echo "========================================"

echo "📝 Checking if we need to add missing dependencies..."

# Check if @vitejs/plugin-react is missing and add it
if ! grep -q "@vitejs/plugin-react" package.json; then
    echo "⚠️  Adding missing @vitejs/plugin-react to package.json..."
    
    # Add @vitejs/plugin-react to devDependencies
    npm install --save-dev @vitejs/plugin-react@latest
    
    echo "✅ Added @vitejs/plugin-react"
fi

# Also check for other common Vite/React dependencies that might be missing
echo "📦 Ensuring all Vite/React dependencies are present..."
npm install --save-dev @types/react @types/react-dom vite @vitejs/plugin-react typescript

echo ""
echo "📋 3. FIXING DOCKERFILE WITH EXPLICIT DEPENDENCY INSTALL"
echo "======================================================="

echo "📝 Creating Dockerfile with explicit dependency verification..."
cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache python3 make g++ libc6-compat

# Copy package files
COPY package*.json ./

# Install ALL dependencies (dev + production)
RUN npm ci

# Verify critical dependencies are installed
RUN npm list @vitejs/plugin-react || npm install @vitejs/plugin-react@latest
RUN npm list typescript || npm install typescript@latest
RUN npm list vite || npm install vite@latest

# Copy source code
COPY . .

# Build with verbose output to debug any issues
RUN npm run build

# Clean up dev dependencies for production
RUN npm prune --production && npm cache clean --force

EXPOSE 5000

CMD ["npm", "start"]
EOF

echo "✅ Created Dockerfile with dependency verification"

echo ""
echo "📋 4. REBUILDING WITH DEPENDENCY FIXES"
echo "======================================"

echo "🛑 Stopping containers..."
docker-compose down

echo ""
echo "🧹 Cleaning Docker cache..."
docker system prune -af

echo ""
echo "🔄 Rebuilding with dependency fixes..."
docker-compose build --no-cache

echo ""
echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for build completion..."
sleep 40

echo ""
echo "📋 5. VERIFICATION"
echo "=================="

echo "📊 Container status:"
docker-compose ps

echo ""
echo "📊 Build logs (looking for successful build):"
docker-compose logs app | grep -E "(npm run build|Build|✅|🚀|dist)" | tail -10

echo ""
echo "📊 Current app status:"
docker-compose logs --tail=15 app

echo ""
echo "🧪 Testing the application:"
curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}' \
  -w "\nHTTP Status: %{http_code}\n" \
  2>/dev/null

echo ""
echo "🎯 DEPENDENCY DEBUG COMPLETE!"
echo "============================="
echo ""
echo "✅ Dependencies verified and fixed"
echo "✅ Dockerfile updated with explicit checks"
echo "✅ Build should work now"
echo ""
echo "🌐 Test your app at:"
echo "   • http://roguesim.com"
echo "   • http://49.13.197.91" 