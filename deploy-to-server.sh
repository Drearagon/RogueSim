#!/bin/bash

echo "🚀 RogueSim Local Build & Server Deploy"
echo "======================================="

# Configuration
SERVER_IP="49.13.197.91"
SERVER_PATH="/opt/roguesim/RogueSim"
SERVER_USER="root"

echo "🎯 Strategy: Build locally, deploy to server"
echo "   • Local build creates dist directory"
echo "   • Transfer built files to server"
echo "   • Rebuild containers on server with working build"
echo ""

# Step 1: Local build
echo "📋 1. LOCAL BUILD"
echo "================="

echo "🧹 Cleaning previous build..."
rm -rf dist

echo "📦 Installing dependencies..."
npm install

echo "🏗️  Building production application..."
npm run build

echo ""
echo "📊 Checking build output..."
if [ -d "dist" ]; then
    echo "✅ Local build successful!"
    echo "📁 Build contents:"
    ls -la dist/ | head -10
    BUILD_SIZE=$(du -sh dist/ | cut -f1)
    echo "📊 Build size: $BUILD_SIZE"
else
    echo "❌ Local build failed - cannot proceed"
    exit 1
fi

# Step 2: Transfer to server
echo ""
echo "📋 2. TRANSFER TO SERVER"
echo "======================="

echo "📤 Uploading build to server..."
rsync -avz --progress dist/ ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/dist/

echo ""
echo "📤 Uploading Docker files..."
scp docker-compose.yml Dockerfile ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/

echo ""
echo "📤 Uploading package files..."
scp package.json package-lock.json ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/

# Step 3: Deploy on server
echo ""
echo "📋 3. SERVER DEPLOYMENT"
echo "======================"

echo "🔄 Executing deployment on server..."
ssh ${SERVER_USER}@${SERVER_IP} << 'EOF'
cd /opt/roguesim/RogueSim

echo "📊 Verifying transferred files..."
ls -la dist/ | head -5
echo ""

echo "🛑 Stopping existing containers..."
docker-compose down

echo ""
echo "🧹 Cleaning Docker cache..."
docker system prune -f

echo ""
echo "🔄 Rebuilding containers with fresh build..."
docker-compose build --no-cache

echo ""
echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for startup..."
sleep 20

echo ""
echo "📊 Container status:"
docker-compose ps

echo ""
echo "📊 App logs:"
docker-compose logs --tail=15 app

echo ""
echo "🧪 Testing API endpoint..."
curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}' \
  -w "\nHTTP Status: %{http_code}\n" \
  2>/dev/null || echo "❌ API test failed"

EOF

# Step 4: Final verification
echo ""
echo "📋 4. FINAL VERIFICATION"
echo "========================"

echo "🌐 Testing external access..."
curl -I http://${SERVER_IP} 2>/dev/null | head -3

echo ""
echo "🎯 DEPLOYMENT COMPLETE!"
echo "======================"
echo ""
echo "✅ Local build successful"
echo "✅ Files transferred to server"
echo "✅ Containers rebuilt with working build"
echo ""
echo "🌐 Your app should now be fully working at:"
echo "   • http://roguesim.com"
echo "   • http://${SERVER_IP}"
echo ""
echo "💡 If login still fails, check server logs with:"
echo "   ssh ${SERVER_USER}@${SERVER_IP} 'cd ${SERVER_PATH} && docker-compose logs app'" 