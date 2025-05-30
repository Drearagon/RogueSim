#!/bin/bash

echo "🔧 Fixing Local API Connection Issues"
echo "===================================="

# Check if we're in the RogueSim directory
if [ ! -f "package.json" ]; then
    echo "❌ Run this from the RogueSim project directory"
    echo "cd /c/Users/Owner/Documents/CursorProjects/AltProjects/RogueSim"
    exit 1
fi

echo "1️⃣  Checking current processes..."
# Check what's running
netstat -ano | findstr :3000
netstat -ano | findstr :5173

echo ""
echo "2️⃣  Creating local development environment file..."
cat > .env.local << 'EOF'
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/roguesim
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres123
POSTGRES_DB=roguesim
SESSION_SECRET=local-dev-session-key
VITE_API_URL=http://localhost:3000
EOF

echo ""
echo "3️⃣  Updating Vite config for local development..."
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
    },
  },
  root: './client',
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: '../dist/public',
    emptyOutDir: true,
  },
  publicDir: 'public'
})
EOF

echo ""
echo "4️⃣  Stopping existing processes..."
# Kill existing Node processes
taskkill /F /IM node.exe 2>/dev/null || echo "No Node processes to kill"

echo ""
echo "5️⃣  Starting backend server..."
# Start the backend in the background
start "RogueSim Backend" cmd /c "npm run server"

echo ""
echo "6️⃣  Waiting for backend to start..."
sleep 5

echo ""
echo "7️⃣  Testing backend connection..."
curl -I http://localhost:3000/api/health 2>/dev/null || echo "Backend starting up..."

echo ""
echo "8️⃣  Starting frontend development server..."
# Start the frontend
start "RogueSim Frontend" cmd /c "npm run dev"

echo ""
echo "9️⃣  Opening browser..."
sleep 3
start http://localhost:5173

echo ""
echo "✅ Local development setup complete!"
echo ""
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:3000"
echo ""
echo "📋 If you still get connection errors:"
echo "1. Check both terminal windows are running"
echo "2. Wait 10-15 seconds for services to fully start"
echo "3. Refresh the browser page"
echo "4. Check the browser console for errors (F12)" 