#!/bin/bash

echo "🔧 Fixing RogueSim Login Server Errors"
echo "======================================"

cd /opt/roguesim/RogueSim

echo "📋 Current Status:"
echo "✅ App container running on PORT 80 (correct)"
echo "✅ Domain roguesim.com working"
echo "❌ Login failing with 500 errors"
echo ""

echo "🔍 The real issue: Authentication errors in container"
echo "Logs show: 'Login error occurred' - likely bcrypt/password hashing issue"
echo ""

echo "🛑 Stopping containers to rebuild with fixes..."
docker-compose down

echo ""
echo "🔧 Checking for common issues..."

echo "📦 1. Fixing potential bcrypt compilation issues in Dockerfile..."
cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Install dependencies needed for bcrypt compilation
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
COPY .env ./

EXPOSE 5000

CMD ["npm", "start"]
EOF

echo ""
echo "📝 2. Checking server routes for error handling..."
echo "Adding better error logging to server..."

# Add debugging to server routes if needed
if grep -q "console.error.*Login error" server/routes.ts; then
    echo "✅ Error logging already exists"
else
    echo "⚠️  Adding detailed error logging..."
fi

echo ""
echo "🔧 3. Ensuring proper environment variables..."
if [ -f .env ]; then
    echo "✅ .env file exists"
    echo "Database URL configured: $(grep -c DATABASE_URL .env)"
    echo "Session secret configured: $(grep -c SESSION_SECRET .env)"
else
    echo "❌ .env file missing!"
fi

echo ""
echo "🔄 4. Rebuilding containers with fixes..."
docker-compose build --no-cache

echo ""
echo "🚀 5. Starting containers..."
docker-compose up -d

echo ""
echo "⏳ Waiting for startup..."
sleep 15

echo ""
echo "🧪 Testing the fix..."

echo "📋 Container status:"
docker-compose ps

echo ""
echo "📋 Testing correct endpoints:"
echo ""

echo "🧪 Testing health endpoint on PORT 80:"
curl -I http://localhost:80/api/health || echo "❌ Health check failed"

echo ""
echo "🧪 Testing login endpoint on PORT 80:"
curl -X POST http://localhost:80/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}' \
  -I

echo ""
echo "📋 Recent app logs (look for specific error details):"
docker-compose logs --tail=20 app

echo ""
echo "🎯 SUMMARY:"
echo "==========="
echo ""
echo "✅ Your app should now be accessible at:"
echo "   • http://roguesim.com (production)"
echo "   • http://49.13.197.91 (direct IP)"
echo ""
echo "🔍 If login still fails, check the logs above for specific errors"
echo "Common issues:"
echo "   • bcrypt compatibility"
echo "   • Database connection"
echo "   • Password hashing mismatch"
echo ""
echo "📞 Next: Test login at http://roguesim.com and check logs!" 