#!/bin/bash

echo "🔒 Setting up SSL Certificate for roguesim.com"
echo "=============================================="

# Check if we're on the server
if [ ! -f "/opt/roguesim/RogueSim/docker-compose.yml" ]; then
    echo "❌ This script should be run on your Hetzner server (49.13.197.91)"
    echo "📋 Commands to run on your server:"
    echo ""
    echo "# 1. Copy this script to your server:"
    echo "scp setup-ssl.sh root@49.13.197.91:/opt/roguesim/"
    echo ""
    echo "# 2. SSH to server and run:"
    echo "ssh root@49.13.197.91"
    echo "cd /opt/roguesim"
    echo "chmod +x setup-ssl.sh"
    echo "./setup-ssl.sh"
    exit 1
fi

cd /opt/roguesim/RogueSim

echo "1️⃣  Installing Certbot (Let's Encrypt client)..."
apt update
apt install -y snapd
snap install core; snap refresh core
snap install --classic certbot
ln -sf /snap/bin/certbot /usr/bin/certbot

echo ""
echo "2️⃣  Stopping containers temporarily..."
docker-compose down

echo ""
echo "3️⃣  Getting SSL certificate for roguesim.com..."
certbot certonly \
    --standalone \
    --preferred-challenges http \
    --email your-email@example.com \
    --agree-tos \
    --no-eff-email \
    -d roguesim.com \
    -d www.roguesim.com

if [ $? -eq 0 ]; then
    echo "✅ SSL certificate obtained successfully!"
else
    echo "❌ Failed to get SSL certificate"
    echo "🔧 Troubleshooting:"
    echo "   - Make sure roguesim.com points to this server (49.13.197.91)"
    echo "   - Check firewall allows port 80"
    echo "   - Verify domain is not already in use"
    exit 1
fi

echo ""
echo "4️⃣  Creating SSL-enabled Nginx configuration..."
cat > nginx-ssl.conf << 'EOF'
server {
    listen 80;
    server_name roguesim.com www.roguesim.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name roguesim.com www.roguesim.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/roguesim.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/roguesim.com/privkey.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
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
    
    # RogueSim App
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
        
        # WebSocket support for real-time features
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;
    }
    
    # pgAdmin (optional - remove if not needed)
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

echo ""
echo "5️⃣  Updating docker-compose with SSL-enabled Nginx..."
cat > docker-compose-ssl.yml << 'EOF'
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
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres:secure_password_2024@db:5432/roguesim
      SESSION_SECRET: super_secure_session_secret_2024_roguesim
      PORT: 3000
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped
    volumes:
      - /etc/letsencrypt:/etc/letsencrypt:ro

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx-ssl.conf:/etc/nginx/conf.d/default.conf
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  pgadmin_data:
EOF

echo ""
echo "6️⃣  Setting up automatic certificate renewal..."
cat > /etc/cron.d/certbot-renew << 'EOF'
# Renew Let's Encrypt certificates twice daily and reload nginx
0 */12 * * * root certbot renew --quiet --deploy-hook "docker-compose -f /opt/roguesim/RogueSim/docker-compose-ssl.yml restart nginx"
EOF

echo ""
echo "7️⃣  Starting services with SSL..."
cp docker-compose-ssl.yml docker-compose.yml
docker-compose up -d

echo ""
echo "8️⃣  Waiting for services to start..."
sleep 20

echo ""
echo "9️⃣  Testing SSL certificate..."
echo "Testing HTTPS connection..."
if curl -Is https://roguesim.com | head -n 1 | grep -q "200 OK"; then
    echo "✅ HTTPS is working!"
else
    echo "⚠️  HTTPS may still be starting up. Check in a few moments."
fi

echo ""
echo "🔟  Final verification..."
echo "HTTP redirect test:"
curl -I http://roguesim.com 2>/dev/null | grep -E "(301|302)" && echo "✅ HTTP redirects to HTTPS" || echo "⚠️  HTTP redirect may need a moment"

echo ""
echo "================================================"
echo "🎉 SSL Setup Complete!"
echo "================================================"
echo ""
echo "🌐 Your secure URLs:"
echo "   • https://roguesim.com"
echo "   • https://www.roguesim.com"
echo "   • https://roguesim.com/pgadmin/ (admin panel)"
echo ""
echo "🔒 SSL Features:"
echo "   • Let's Encrypt certificate (free, trusted)"
echo "   • Automatic renewal every 12 hours"
echo "   • HTTP to HTTPS redirect"
echo "   • Security headers enabled"
echo "   • Gzip compression"
echo ""
echo "🔧 Certificate location:"
echo "   /etc/letsencrypt/live/roguesim.com/"
echo ""
echo "📋 To check certificate status:"
echo "   certbot certificates"
echo ""
echo "🔄 To manually renew:"
echo "   certbot renew"
echo ""
echo "🎮 RogueSim is now secure and ready!" 