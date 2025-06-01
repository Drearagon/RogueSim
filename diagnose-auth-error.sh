#!/bin/bash

echo "🔍 Diagnosing Authentication Errors"
echo "==================================="

cd /opt/roguesim/RogueSim

echo "📋 Quick diagnosis of your login errors..."
echo ""

echo "🧪 1. Testing actual app endpoint (PORT 80):"
echo "Your app is on PORT 80, not 8080 (that's pgAdmin)"
echo ""

echo "📊 Health check:"
curl -s http://localhost/api/health | head -5 || echo "❌ App not responding on port 80"

echo ""
echo "📊 Login test with detailed error:"
RESPONSE=$(curl -s -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}' 2>&1)

echo "Response: $RESPONSE"

echo ""
echo "📋 2. Container logs analysis:"
echo "Looking for specific error patterns..."

echo ""
echo "🔍 Authentication errors:"
docker-compose logs app 2>/dev/null | grep -i "error" | tail -10

echo ""
echo "🔍 Database connection status:"
docker-compose logs app 2>/dev/null | grep -i "database\|postgres\|connected" | tail -5

echo ""
echo "🔍 Server startup status:"
docker-compose logs app 2>/dev/null | grep -i "running\|started\|listening" | tail -5

echo ""
echo "📋 3. Environment check:"
echo "Checking if server has correct environment..."

echo ""
echo "🔧 Database URL in container:"
docker-compose exec app env | grep DATABASE_URL | cut -c 1-50 || echo "❌ DATABASE_URL not found"

echo ""
echo "🔧 Node environment:"
docker-compose exec app env | grep NODE_ENV || echo "❌ NODE_ENV not found"

echo ""
echo "📋 4. Port verification:"
echo "Confirming port mapping..."

echo ""
echo "🌐 Ports in use:"
netstat -tlnp | grep -E ":(80|8080|5432)" | head -5

echo ""
echo "🎯 DIAGNOSIS SUMMARY:"
echo "==================="
echo ""
echo "✅ If you see 'Connected to PostgreSQL' above - database is OK"
echo "✅ If you see '🚀 RogueSim server running' - server startup is OK"
echo "❌ If you see repeated 'Login error occurred' - this is the authentication bug"
echo ""
echo "🔧 Most likely causes:"
echo "   1. bcrypt compilation issue in Docker"
echo "   2. Password hashing mismatch"
echo "   3. Database user lookup failing"
echo ""
echo "📞 Run ./fix-login-server-error.sh to apply the fix!" 