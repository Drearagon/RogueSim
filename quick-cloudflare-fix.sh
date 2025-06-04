#!/bin/bash

echo "🚀 Quick Cloudflare Fix (No pgAdmin)"
echo "===================================="

# Check if we're on the server
if [ ! -f "/opt/roguesim/RogueSim/docker-compose.yml" ]; then
    echo "❌ This script should be run on your Hetzner server (49.13.197.91)"
    echo "📋 Run these commands:"
    echo ""
    echo "scp quick-cloudflare-fix.sh root@49.13.197.91:/opt/roguesim/"
    echo "ssh root@49.13.197.91"
    echo "cd /opt/roguesim && chmod +x quick-cloudflare-fix.sh && ./quick-cloudflare-fix.sh"
    exit 1
fi

cd /opt/roguesim/RogueSim

echo "1️⃣  Stopping current services..."
docker-compose down

echo ""
echo "2️⃣  Creating production environment..."
cat > .env.production << 'EOF'
NODE_ENV=production
DATABASE_URL=postgresql://postgres:secure_password_2024@db:5432/roguesim
SESSION_SECRET=super_secure_session_secret_2024_roguesim
PORT=3000
VITE_API_URL=https://roguesim.com/api
PUBLIC_URL=https://roguesim.com
ORIGIN=https://roguesim.com
EOF

echo "3️⃣  Creating Nginx config for Cloudflare..."
cat > nginx-simple.conf << 'EOF'
# Cloudflare Real IP restoration
set_real_ip_from 173.245.48.0/20;
set_real_ip_from 103.21.244.0/22;
set_real_ip_from 103.22.200.0/22;
set_real_ip_from 103.31.4.0/22;
set_real_ip_from 141.101.64.0/18;
set_real_ip_from 108.162.192.0/18;
set_real_ip_from 190.93.240.0/20;
set_real_ip_from 188.114.96.0/20;
set_real_ip_from 197.234.240.0/22;
set_real_ip_from 198.41.128.0/17;
set_real_ip_from 162.158.0.0/15;
set_real_ip_from 104.16.0.0/13;
set_real_ip_from 104.24.0.0/14;
set_real_ip_from 172.64.0.0/13;
set_real_ip_from 131.0.72.0/22;
real_ip_header CF-Connecting-IP;

server {
    listen 80;
    server_name roguesim.com www.roguesim.com;
    
    # CORS headers for API routes
    location /api/ {
        add_header Access-Control-Allow-Origin "https://roguesim.com" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, PATCH, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With" always;
        add_header Access-Control-Allow-Credentials "true" always;
        
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "https://roguesim.com";
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, PATCH, OPTIONS";
            add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With";
            add_header Access-Control-Allow-Credentials "true";
            add_header Content-Length 0;
            add_header Content-Type text/plain;
            return 204;
        }
        
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # All other routes
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

echo "4️⃣  Creating simplified Docker Compose..."
cat > docker-compose-simple.yml << 'EOF'
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: roguesim
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: secure_password_2024
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env.production
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx-simple.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
EOF

echo "5️⃣  Starting services..."
cp docker-compose-simple.yml docker-compose.yml
docker-compose build --no-cache
docker-compose up -d

echo ""
echo "6️⃣  Waiting for services..."
sleep 20

echo "7️⃣  Testing services..."
docker-compose ps

echo ""
echo "🎉 Quick fix complete!"
echo ""
echo "✅ What was fixed:"
echo "   • Removed problematic pgAdmin"
echo "   • Added CORS headers for Cloudflare"
echo "   • Simplified configuration"
echo "   • Production environment set"
echo ""
echo "🌐 Test your site:"
echo "   https://roguesim.com"
echo ""
echo "🔧 If login still fails:"
echo "   1. Clear browser cache/cookies"
echo "   2. Try incognito/private mode"
echo "   3. Check browser console for errors"
echo "   4. Verify Cloudflare SSL is 'Flexible'" 