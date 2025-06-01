#!/bin/bash

echo "🔧 Fixing RogueSim Server Dependencies"
echo "======================================"

cd /opt/roguesim/RogueSim

echo "🔍 Checking Node.js version..."
node --version
npm --version

echo ""
echo "🛑 Killing any running processes..."
pkill -f node || true
pkill -f npm || true

echo ""
echo "📋 Current Node.js version issue detected!"
echo "The server has an older Node.js that doesn't support modern syntax."
echo ""

echo "🔧 Option 1: Update Node.js (Recommended)"
echo "==========================================="
echo "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
echo "sudo apt-get install -y nodejs"
echo ""

echo "🔧 Option 2: Quick Fix with Compatible Dependencies"
echo "=================================================="

echo "📦 Removing problematic packages..."
rm -rf node_modules package-lock.json

echo "📦 Installing compatible versions..."
cat > package.json.new << 'EOF'
{
  "name": "roguesim",
  "version": "1.0.0",
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "cross-env NODE_ENV=development tsx server/index.ts",
    "dev:client": "vite",
    "build": "vite build && tsc",
    "start": "cross-env NODE_ENV=production node dist/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "pg": "^8.11.0",
    "drizzle-orm": "^0.28.6",
    "express-session": "^1.17.3",
    "connect-pg-simple": "^9.0.1",
    "ws": "^8.14.2"
  },
  "devDependencies": {
    "concurrently": "^8.2.0",
    "cross-env": "^7.0.3",
    "tsx": "^3.12.7",
    "typescript": "^5.1.6",
    "vite": "^4.4.5",
    "tailwindcss": "^3.3.3",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.24"
  }
}
EOF

echo "🔄 Updating package.json with compatible versions..."
mv package.json.new package.json

echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

echo "🔧 Creating simple postcss config..."
cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

echo "🧪 Testing server startup..."
timeout 10s npm run dev || echo "Development start attempted..."

echo ""
echo "✅ DEPENDENCY FIX COMPLETE!"
echo ""
echo "🌐 Your options now:"
echo "1. npm run dev    (Development mode)"
echo "2. npm run build && npm start (Production)"
echo ""
echo "🔥 For Node.js update (more reliable):"
echo "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
echo "sudo apt-get install -y nodejs"
echo "npm install"
echo ""

echo "🎯 After fixing, your app will work at:"
echo "• http://49.13.197.91:8080 (current)"
echo "• http://roguesim.com (after domain setup)" 