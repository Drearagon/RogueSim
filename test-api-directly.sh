#!/bin/bash

echo "🧪 Testing API Directly"
echo "======================"

cd /opt/roguesim/RogueSim

echo "🔍 Testing your API endpoints to see the actual errors..."
echo ""

echo "📋 1. Testing health endpoint:"
curl -v http://localhost:8080/api/health 2>&1 | head -20

echo ""
echo "📋 2. Testing login endpoint with sample data:"
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}' \
  -v 2>&1

echo ""
echo "📋 3. Testing if server is responding at all:"
curl -I http://localhost:8080/ 2>&1

echo ""
echo "📋 4. Checking container health:"
docker-compose exec app ps aux | grep node || echo "❌ Node process not found in container"

echo ""
echo "📋 5. Checking app logs in real-time (last 30 lines):"
docker-compose logs --tail=30 app | grep -E "(error|Error|ERROR|fail|Fail|FAIL)" || echo "No obvious errors found"

echo ""
echo "🎯 This will show us the exact error causing the 500 response!" 