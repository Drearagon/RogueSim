#!/bin/bash

# RogueSim Hetzner Deployment Script
echo "🚀 Deploying RogueSim to Hetzner Server..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 This script will help you deploy RogueSim to your Hetzner server${NC}"
echo ""

# Get server IP
read -p "Enter your Hetzner server IP address: " SERVER_IP

if [ -z "$SERVER_IP" ]; then
    echo -e "${RED}❌ Server IP is required${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Using server IP: $SERVER_IP${NC}"
echo ""

# Test SSH connection
echo -e "${BLUE}🔑 Testing SSH connection...${NC}"
if ssh -o ConnectTimeout=10 root@$SERVER_IP "echo 'SSH connection successful'" 2>/dev/null; then
    echo -e "${GREEN}✅ SSH connection working${NC}"
else
    echo -e "${RED}❌ Cannot connect to server. Please check:${NC}"
    echo "   - Server IP is correct"
    echo "   - SSH key is set up"
    echo "   - Server is running"
    exit 1
fi

echo ""
echo -e "${BLUE}📦 Starting deployment...${NC}"

# Upload and deploy
ssh root@$SERVER_IP << 'ENDSSH'
    # Update system
    echo "🔄 Updating system packages..."
    apt update && apt upgrade -y
    
    # Install Docker
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    
    # Install Docker Compose
    apt install docker-compose-plugin -y
    
    # Install Nginx
    echo "🌐 Installing Nginx..."
    apt install nginx certbot python3-certbot-nginx -y
    
    # Clone RogueSim
    echo "📥 Cloning RogueSim repository..."
    cd /opt
    rm -rf RogueSim
    git clone https://github.com/Drearagon/RogueSim.git
    cd RogueSim
    
    # Create production environment file
    echo "⚙️ Creating production environment..."
    cat > .env << EOF
NODE_ENV=production
PORT=5000

# Database Configuration  
DATABASE_URL=postgresql://roguesim_user:nZrdLEehQFVTZ9ogVZXxmfpKOe68thkQTtwuVXaokQM=@postgres:5432/roguesim

# Session Configuration
SESSION_SECRET=nZrdLEehQFVTZ9ogVZXxmfpKOe68thkQTtwuVXaokQM=

# Domain Configuration
DOMAIN=roguesim.com
BASE_URL=https://roguesim.com

# Security
TRUST_PROXY=true

# Email Configuration
SENDGRID_API_KEY=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
FROM_EMAIL=uplink@roguesim.com
EOF

    # Create production Docker Compose
    cat > docker-compose.prod.yml << EOF
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: roguesim-postgres
    environment:
      POSTGRES_DB: roguesim
      POSTGRES_USER: roguesim_user
      POSTGRES_PASSWORD: nZrdLEehQFVTZ9ogVZXxmfpKOe68thkQTtwuVXaokQM=
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped
    networks:
      - roguesim-network

  roguesim:
    build: .
    container_name: roguesim-app
    ports:
      - "127.0.0.1:5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://roguesim_user:nZrdLEehQFVTZ9ogVZXxmfpKOe68thkQTtwuVXaokQM=@postgres:5432/roguesim
      - SESSION_SECRET=nZrdLEehQFVTZ9ogVZXxmfpKOe68thkQTtwuVXaokQM=
      - SENDGRID_API_KEY=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
      - TRUST_PROXY=true
    depends_on:
      - postgres
    restart: unless-stopped
    networks:
      - roguesim-network
    volumes:
      - ./logs:/app/logs

volumes:
  postgres_data:

networks:
  roguesim-network:
    driver: bridge
EOF
    
    # Start the application
    echo "🚀 Starting RogueSim..."
    docker compose -f docker-compose.prod.yml up -d --build
    
    # Configure Nginx
    echo "⚙️ Configuring Nginx..."
    cat > /etc/nginx/sites-available/roguesim.com << 'EOF'
server {
    listen 80;
    server_name roguesim.com www.roguesim.com;
    
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_buffering off;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
    
    # Enable the site
    ln -sf /etc/nginx/sites-available/roguesim.com /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Test and reload Nginx
    nginx -t && systemctl reload nginx
    
    echo "✅ Deployment complete!"
    echo "🌐 Your server is now running at http://$(curl -4 ifconfig.me)"
    echo "📝 Next step: Wait for DNS propagation, then run SSL setup"
    
ENDSSH

echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. Wait 5-10 minutes for DNS propagation"
echo "2. Test your domain: http://roguesim.com"
echo "3. Run SSL setup: ssh root@$SERVER_IP 'certbot --nginx -d roguesim.com -d www.roguesim.com'"
echo ""
echo -e "${GREEN}🚀 Your RogueSim will be live at: https://roguesim.com${NC}" 