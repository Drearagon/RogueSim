#!/bin/bash

echo "🔍 RogueSim Server Diagnostics"
echo "================================"
echo "Time: $(date)"
echo "Server: $(hostname)"
echo ""

# Check if we're in the right directory
echo "📁 Current directory: $(pwd)"
if [ ! -f "docker-compose.yml" ]; then
    echo "⚠️  Not in RogueSim directory, navigating..."
    cd /opt/roguesim/RogueSim
    echo "📁 Now in: $(pwd)"
fi

echo ""
echo "1️⃣  Checking Docker status..."
systemctl status docker --no-pager | head -5

echo ""
echo "2️⃣  Checking Docker containers..."
docker ps -a

echo ""
echo "3️⃣  Checking if port 3000 is listening..."
netstat -tlpn | grep :3000 || echo "❌ Nothing listening on port 3000"

echo ""
echo "4️⃣  Checking nginx status..."
systemctl status nginx --no-pager | head -5

echo ""
echo "5️⃣  Testing local connection to app..."
curl -f http://localhost:3000 2>/dev/null && echo "✅ App responds on localhost:3000" || echo "❌ App not responding on localhost:3000"

echo ""
echo "6️⃣  Checking nginx error logs (last 10 lines)..."
tail -10 /var/log/nginx/error.log

echo ""
echo "7️⃣  Checking disk space..."
df -h | grep -E "(Filesystem|/dev/)"

echo ""
echo "8️⃣  Checking memory usage..."
free -h

echo ""
echo "🔧 Quick fix options:"
echo "If containers are down: docker-compose up -d"
echo "If app not responding: docker-compose restart"
echo "If nginx issues: systemctl restart nginx"
echo "If disk full: docker system prune -f" 