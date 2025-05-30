#!/bin/bash

echo "🔧 Quick Fix for server/vite.ts Syntax Error"
echo "============================================="

cd /opt/roguesim/RogueSim

echo "1️⃣  Fixing syntax error in server/vite.ts..."

# Replace the problematic lines with correct syntax
sed -i 's/\\`/`/g' server/vite.ts

echo "2️⃣  Checking if fix applied..."
if grep -q '\\`' server/vite.ts; then
    echo "❌ Still has escaped backticks, applying manual fix..."
    
    # Manual fix for the template literal
    cat > /tmp/vite_template.txt << 'EOF'
        src="/src/main.tsx",
EOF
    
    # Replace the problematic line
    sed -i '59s/.*/        src="\/src\/main.tsx",/' server/vite.ts
    
    echo "✅ Manual fix applied"
else
    echo "✅ Syntax error fixed"
fi

echo ""
echo "3️⃣  Stopping containers..."
docker-compose down

echo ""
echo "4️⃣  Rebuilding with fixed code..."
docker-compose build --no-cache app

echo ""
echo "5️⃣  Starting containers..."
docker-compose up -d

echo ""
echo "6️⃣  Waiting for startup..."
sleep 15

echo ""
echo "7️⃣  Testing the fix..."
docker logs --tail 10 roguesim-app-1

echo ""
echo "8️⃣  Testing HTTP response..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")
echo "HTTP Status: $HTTP_STATUS"

if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "302" ]; then
    echo "✅ SUCCESS! RogueSim is working!"
    echo "🌐 Test: curl -I http://roguesim.com"
else
    echo "❌ Still having issues. HTTP status: $HTTP_STATUS"
    echo "📋 Recent logs:"
    docker logs --tail 20 roguesim-app-1
fi

echo ""
echo "🎉 Fix attempt completed!" 