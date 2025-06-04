#!/bin/bash

echo "🌐 Setting up roguesim.com domain"
echo "================================="
echo "Server: 49.13.197.91"
echo "Domain: roguesim.com"
echo ""

# Update system and install nginx
echo "📦 Installing nginx..."
apt update
apt install -y nginx

# Stop nginx to configure it
systemctl stop nginx

# Create nginx configuration for roguesim.com
echo "📝 Creating nginx configuration..."
cat > /etc/nginx/sites-available/roguesim.com << 'EOF'
server {
    listen 80;
    server_name roguesim.com www.roguesim.com;

    # Allow large uploads for game assets
    client_max_body_size 100M;

    # Proxy to RogueSim app
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
        
        # WebSocket support for multiplayer
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeout settings
        proxy_connect_timeout       60s;
        proxy_send_timeout          60s;
        proxy_read_timeout          60s;
    }

    # Optional: Serve pgAdmin on subdomain
    location /pgadmin/ {
        proxy_pass http://localhost:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
EOF

# Enable the site
echo "🔗 Enabling nginx site..."
ln -sf /etc/nginx/sites-available/roguesim.com /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
echo "🧪 Testing nginx configuration..."
if nginx -t; then
    echo "✅ Nginx configuration is valid!"
else
    echo "❌ Nginx configuration error!"
    exit 1
fi

# Start nginx
echo "🚀 Starting nginx..."
systemctl start nginx
systemctl enable nginx

# Check if RogueSim is running
echo "🔍 Checking RogueSim status..."
if curl -f http://localhost:3000 >/dev/null 2>&1; then
    echo "✅ RogueSim is running on port 3000!"
else
    echo "⚠️  RogueSim may not be running. Starting it..."
    cd /opt/roguesim/RogueSim
    docker-compose up -d
    sleep 5
fi

# Test the domain setup
echo "🌐 Testing domain setup..."
if curl -f http://localhost >/dev/null 2>&1; then
    echo "✅ Nginx is proxying correctly!"
else
    echo "⚠️  Nginx proxy may need adjustment"
fi

echo ""
echo "✅ Domain setup complete!"
echo ""
echo "🌐 Your RogueSim should now be accessible at:"
echo "• http://roguesim.com"
echo "• http://www.roguesim.com" 
echo "• http://49.13.197.91"
echo ""
echo "🔧 pgAdmin available at:"
echo "• http://roguesim.com/pgladmin/"
echo "• Login: uplink@roguesim.com / roguesim123"
echo ""
echo "📊 Check status:"
echo "• nginx -t (test config)"
echo "• systemctl status nginx"
echo "• docker-compose ps"
echo ""
echo "🔒 Next step: Set up SSL with Let's Encrypt"
echo "Run: certbot --nginx -d roguesim.com -d www.roguesim.com" 