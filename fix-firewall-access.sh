#!/bin/bash

echo "🔥 RogueSim Firewall & Access Fix"
echo "================================="

cd /opt/roguesim/RogueSim

echo "🔍 Checking current firewall status..."
ufw status verbose || echo "UFW not active"

echo ""
echo "🔍 Checking if port 8080 is listening..."
netstat -tlnp | grep :8080

echo ""
echo "🔍 Checking iptables rules..."
iptables -L -n | grep 8080 || echo "No iptables rules for port 8080"

echo ""
echo "🔧 Opening port 8080 in firewall..."

# Try different firewall methods
if command -v ufw >/dev/null 2>&1; then
    echo "▶ Using UFW (Ubuntu Firewall)..."
    ufw allow 8080/tcp
    ufw allow 8080
    ufw --force enable
    echo "✅ UFW rules added for port 8080"
fi

if command -v firewall-cmd >/dev/null 2>&1; then
    echo "▶ Using firewalld (CentOS/RHEL)..."
    firewall-cmd --permanent --add-port=8080/tcp
    firewall-cmd --reload
    echo "✅ Firewalld rules added for port 8080"
fi

# Direct iptables as fallback
echo "▶ Adding direct iptables rule..."
iptables -I INPUT -p tcp --dport 8080 -j ACCEPT
echo "✅ Iptables rule added for port 8080"

echo ""
echo "🔍 Checking Docker containers..."
docker-compose ps

echo ""
echo "🧪 Testing internal connectivity..."
if curl -s http://localhost:8080 > /dev/null; then
    echo "✅ Internal connection: WORKING"
else
    echo "❌ Internal connection: FAILED"
    echo "🔧 Restarting containers..."
    docker-compose restart app
    sleep 10
fi

echo ""
echo "🧪 Testing external connectivity..."
# Get the server's external IP
EXTERNAL_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip || echo "49.13.197.91")
echo "Server external IP: $EXTERNAL_IP"

echo ""
echo "🌐 Testing HTTP response..."
curl -I http://localhost:8080 2>/dev/null || echo "No HTTP response"

echo ""
echo "🔍 Final firewall status:"
ufw status || echo "UFW not available"

echo ""
echo "🔍 Final port listening status:"
ss -tlnp | grep :8080 || netstat -tlnp | grep :8080

echo ""
echo "✅ Firewall configuration complete!"
echo ""
echo "🌐 Your app should now be accessible at:"
echo "   • http://49.13.197.91:8080"
echo "   • http://$EXTERNAL_IP:8080"
echo ""
echo "🔥 If still not working, check cloud provider firewall:"
echo "   • Hetzner Cloud Console → Firewalls"
echo "   • Add inbound rule: TCP port 8080"
echo ""
echo "🧪 Test from your browser or run:"
echo "   curl -I http://49.13.197.91:8080" 