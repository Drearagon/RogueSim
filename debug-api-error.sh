#!/bin/bash

echo "🔍 Debugging API Server Error"
echo "============================="

cd /opt/roguesim/RogueSim

echo "🔍 Checking what's running on your server..."
echo ""
echo "📋 Container Status:"
docker-compose ps

echo ""
echo "📋 Port Usage:"
netstat -tlnp | grep -E ':(80|443|8080|5000)'

echo ""
echo "🔍 Checking Docker logs for errors..."
echo ""
echo "📋 App Container Logs (last 50 lines):"
docker-compose logs --tail=50 app

echo ""
echo "📋 Database Container Logs (last 20 lines):"
docker-compose logs --tail=20 db

echo ""
echo "🧪 Testing API endpoints directly..."
echo ""
echo "📋 Testing /api/health:"
curl -I http://localhost:8080/api/health 2>/dev/null || echo "❌ Health check failed"

echo ""
echo "📋 Testing /api/auth/login (should show method not allowed for GET):"
curl -I http://localhost:8080/api/auth/login 2>/dev/null || echo "❌ Auth endpoint not responding"

echo ""
echo "🔍 Environment Variables Check:"
echo ""
echo "📋 Checking .env file:"
if [ -f .env ]; then
    echo "✅ .env file exists"
    echo "Database URL present: $(grep -c DATABASE_URL .env)"
    echo "Session Secret present: $(grep -c SESSION_SECRET .env)"
else
    echo "❌ .env file missing!"
fi

echo ""
echo "🔍 Docker Environment:"
docker-compose exec app env | grep -E "(DATABASE|SESSION|NODE)" || echo "❌ Cannot access container environment"

echo ""
echo "🎯 NEXT STEPS:"
echo "=============="
echo ""
echo "1. Check the app container logs above for specific errors"
echo "2. If you see database connection errors, that's the issue"
echo "3. If you see missing environment variables, we need to fix .env"
echo "4. If containers aren't running, we need to restart them"
echo ""
echo "🔧 Quick fixes to try:"
echo "• docker-compose restart"
echo "• docker-compose down && docker-compose up -d"
echo "• Check if .env has correct DATABASE_URL" 