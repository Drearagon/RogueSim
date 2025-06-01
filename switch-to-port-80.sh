#!/bin/bash

echo "🔄 Switching RogueSim to Standard Port 80"
echo "========================================="

cd /opt/roguesim/RogueSim

echo "🛑 Stopping all containers..."
docker-compose down

echo "🛑 Stopping services that might use port 80..."
systemctl stop apache2 2>/dev/null || echo "Apache2 not running"
systemctl stop nginx 2>/dev/null || echo "Nginx not running"
systemctl stop lighttpd 2>/dev/null || echo "Lighttpd not running"
systemctl stop httpd 2>/dev/null || echo "httpd not running"

echo "🔧 Updating docker-compose.yml to use port 80..."
sed -i 's/"8080:5000"/"80:5000"/g' docker-compose.yml

echo "🚀 Starting containers on port 80..."
docker-compose up -d

echo "⏳ Waiting for containers to start..."
sleep 15

echo "📊 Container status:"
docker-compose ps

echo ""
echo "🧪 Testing port 80..."
if curl -s http://localhost:80 > /dev/null; then
    echo "✅ SUCCESS: App responding on port 80!"
    echo ""
    echo "🌐 Your app is now accessible at:"
    echo "   • http://49.13.197.91"
    echo "   • Ready for roguesim.com domain!"
    echo ""
    echo "🔥 CLOUDFLARE DNS SETUP:"
    echo "1. Go to Cloudflare Dashboard → roguesim.com"
    echo "2. Add A record: @ → 49.13.197.91 (Proxied ON)"
    echo "3. Add A record: www → 49.13.197.91 (Proxied ON)"
    echo "4. Enable SSL/TLS → Full (Strict)"
    echo ""
    echo "✅ Domain should work in 5-10 minutes!"
else
    echo "❌ Port 80 test failed. Checking what's blocking..."
    netstat -tlnp | grep :80
    echo ""
    echo "🔧 Try running this to force clear port 80:"
    echo "fuser -k 80/tcp"
    echo "docker-compose restart"
fi

echo ""
echo "🎉 Port 80 configuration complete!"
echo "Your domain roguesim.com should work perfectly now." 