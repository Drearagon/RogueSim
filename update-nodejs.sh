#!/bin/bash

echo "🚀 Updating Node.js to Fix RogueSim"
echo "==================================="

echo "📋 Current versions:"
node --version
npm --version

echo ""
echo "🛑 Stopping any running services..."
pkill -f node || true
docker-compose down 2>/dev/null || true

echo ""
echo "📦 Installing Node.js 18 (LTS)..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

echo ""
echo "✅ Updated versions:"
node --version
npm --version

echo ""
echo "🔧 Fixing RogueSim dependencies..."
cd /opt/roguesim/RogueSim

# Clean install
rm -rf node_modules package-lock.json
npm install

echo ""
echo "🧪 Testing application..."
npm run build

echo ""
echo "🚀 Starting containers..."
docker-compose up -d

echo ""
echo "⏳ Waiting for startup..."
sleep 15

echo ""
echo "🧪 Testing application response..."
if curl -s http://localhost:8080 > /dev/null; then
    echo "✅ SUCCESS! Application is running!"
    echo ""
    echo "🌐 Your app is now accessible at:"
    echo "• http://49.13.197.91:8080"
    echo "• Ready for roguesim.com domain setup!"
else
    echo "⚠️  App not responding yet. Check with:"
    echo "docker-compose ps"
    echo "docker-compose logs"
fi

echo ""
echo "🎉 Node.js update complete!"
echo "Your login issues should now be resolved." 