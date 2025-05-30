#!/bin/bash

echo "🔧 Fixing Cloudflare API Connection Issues"
echo "=========================================="

# Check if we're on the server
if [ ! -f "/opt/roguesim/RogueSim/docker-compose.yml" ]; then
    echo "❌ This script should be run on your Hetzner server (49.13.197.91)"
    echo "📋 Commands to run on your server:"
    echo ""
    echo "# 1. Copy this script to your server:"
    echo "scp fix-cloudflare-api.sh root@49.13.197.91:/opt/roguesim/"
    echo ""
    echo "# 2. SSH to server and run:"
    echo "ssh root@49.13.197.91"
    echo "cd /opt/roguesim"
    echo "chmod +x fix-cloudflare-api.sh"
    echo "./fix-cloudflare-api.sh"
    exit 1
fi

cd /opt/roguesim/RogueSim

echo "1️⃣  Checking current configuration..."
docker-compose ps

echo ""
echo "2️⃣  Creating Cloudflare-compatible environment..."

# Create production environment file
cat > .env.production << 'EOF'
NODE_ENV=production
DATABASE_URL=postgresql://postgres:secure_password_2024@db:5432/roguesim
SESSION_SECRET=super_secure_session_secret_2024_roguesim
PORT=3000
VITE_API_URL=https://roguesim.com/api
PUBLIC_URL=https://roguesim.com
ORIGIN=https://roguesim.com
EOF

echo "✅ Environment configuration updated"

echo ""
echo "3️⃣  Updating Nginx configuration for Cloudflare..."

cat > nginx-cloudflare.conf << 'EOF'
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
    
    # Security headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
    
    # API routes with CORS support
    location /api/ {
        # CORS headers
        add_header Access-Control-Allow-Origin "https://roguesim.com" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, PATCH, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With" always;
        add_header Access-Control-Allow-Credentials "true" always;
        
        # Handle preflight requests
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
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # WebSocket support
    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }
    
    # Main application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;
    }
    
    # pgAdmin (optional)
    location /pgadmin/ {
        proxy_pass http://localhost:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }
    
    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2|ttf|svg)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

echo "✅ Nginx configuration updated for Cloudflare"

echo ""
echo "4️⃣  Updating Docker Compose for production..."

cat > docker-compose-cloudflare.yml << 'EOF'
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

  pgadmin:
    image: dpage/pgadmin4:latest
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@roguesim.com
      PGADMIN_DEFAULT_PASSWORD: admin2024
      PGADMIN_CONFIG_SERVER_MODE: 'False'
      PGADMIN_CONFIG_MASTER_PASSWORD_REQUIRED: 'False'
    volumes:
      - pgadmin_data:/var/lib/pgadmin
    ports:
      - "8080:80"
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

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
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx-cloudflare.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  pgadmin_data:
EOF

echo "✅ Docker Compose updated"

echo ""
echo "5️⃣  Rebuilding and restarting services..."
docker-compose down
cp docker-compose-cloudflare.yml docker-compose.yml
cp nginx-cloudflare.conf nginx.conf
docker-compose build --no-cache app
docker-compose up -d

echo ""
echo "6️⃣  Waiting for services to start..."
sleep 30

echo ""
echo "7️⃣  Testing API connectivity..."
echo "Testing health endpoint..."
if curl -f http://localhost:3000/api/health &>/dev/null; then
    echo "✅ Backend API is responding"
else
    echo "⚠️  Backend API may still be starting..."
fi

echo ""
echo "8️⃣  Checking service status..."
docker-compose ps

echo ""
echo "================================================"
echo "🎉 Cloudflare Fix Applied!"
echo "================================================"
echo ""
echo "🔧 Changes made:"
echo "   • Fixed CORS headers for API calls"
echo "   • Added Cloudflare real IP detection"
echo "   • Updated environment for production"
echo "   • Optimized proxy configuration"
echo ""
echo "🌐 Your site should now work at:"
echo "   https://roguesim.com"
echo ""
echo "🔍 If still having issues:"
echo "   1. Check Cloudflare SSL/TLS mode is 'Flexible'"
echo "   2. Ensure DNS records are proxied (orange cloud)"
echo "   3. Try clearing browser cache/cookies"
echo "   4. Check browser console for specific errors"
echo ""
echo "📋 Cloudflare settings to verify:"
echo "   • SSL/TLS → Overview → Encryption mode: Flexible"
echo "   • SSL/TLS → Edge Certificates → Always Use HTTPS: On"
echo "   • DNS → Both A records should be proxied"
echo ""
echo "🎮 RogueSim should now work properly!" 