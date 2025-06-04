#!/bin/bash

set -e  # Exit on any error

echo "🚀 RogueSim Direct Server Deployment"
echo "======================================"

# Update system packages
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install prerequisites
echo "🔧 Installing prerequisites..."
apt install -y ca-certificates curl gnupg lsb-release git

# Install Docker
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    # Add Docker's official GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Add Docker repository
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Update package index
    apt update
    
    # Install Docker
    apt install -y docker-ce docker-ce-cli containerd.io
else
    echo "✅ Docker already installed"
fi

# Start and enable Docker
systemctl start docker
systemctl enable docker

# Install Docker Compose
echo "🔧 Installing Docker Compose..."
DOCKER_COMPOSE_CMD=""

# Method 1: Try Docker Compose plugin
if apt install -y docker-compose-plugin 2>/dev/null; then
    echo "✅ Docker Compose plugin installed"
    if docker compose version &> /dev/null; then
        DOCKER_COMPOSE_CMD="docker compose"
        echo "✅ Using Docker Compose plugin: $DOCKER_COMPOSE_CMD"
    fi
fi

# Method 2: Try standalone Docker Compose if plugin didn't work
if [ -z "$DOCKER_COMPOSE_CMD" ]; then
    echo "📥 Installing standalone Docker Compose..."
    DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
    curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    if /usr/local/bin/docker-compose version &> /dev/null; then
        DOCKER_COMPOSE_CMD="/usr/local/bin/docker-compose"
        echo "✅ Using standalone Docker Compose: $DOCKER_COMPOSE_CMD"
    fi
fi

# Method 3: Final fallback
if [ -z "$DOCKER_COMPOSE_CMD" ]; then
    echo "❌ Docker Compose installation failed. Trying alternative..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/bin/docker-compose
    chmod +x /usr/bin/docker-compose
    
    if /usr/bin/docker-compose version &> /dev/null; then
        DOCKER_COMPOSE_CMD="/usr/bin/docker-compose"
        echo "✅ Using fallback Docker Compose: $DOCKER_COMPOSE_CMD"
    else
        echo "❌ Critical Error: Could not install Docker Compose"
        echo "Please install Docker Compose manually and re-run this script"
        exit 1
    fi
fi

echo "🔍 Final Docker Compose check: $DOCKER_COMPOSE_CMD"
$DOCKER_COMPOSE_CMD version

# Install Nginx and Certbot
echo "🌐 Installing Nginx and Certbot..."
apt install -y nginx certbot python3-certbot-nginx

# Clone or update RogueSim repository
echo "📥 Setting up RogueSim repository..."
if [ -d "/root/RogueSim" ]; then
    echo "📁 Repository exists, updating..."
    cd /root/RogueSim
    git pull origin main
else
    echo "📥 Cloning repository..."
    cd /root
    git clone https://github.com/Drearagon/RogueSim.git
    cd RogueSim
fi

# Create production environment file
echo "⚙️ Creating production environment..."
cat > .env.production << EOF
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://roguesim_user:nZrdLEehQFVTZ9ogVZXxmfpKOe68thkQTtwuVXaokQM=@localhost:5432/roguesim_db
FRONTEND_URL=https://roguesim.com
CORS_ORIGIN=https://roguesim.com,https://www.roguesim.com

# SendGrid Configuration
SENDGRID_API_KEY=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
SENDGRID_FROM_EMAIL=uplink@roguesim.com
SENDGRID_FROM_NAME=RogueSim

# Session Configuration
SESSION_SECRET=nZrdLEehQFVTZ9ogVZXxmfpKOe68thkQTtwuVXaokQM=
COOKIE_DOMAIN=roguesim.com

# Database Configuration
POSTGRES_DB=roguesim_db
POSTGRES_USER=roguesim_user
POSTGRES_PASSWORD=nZrdLEehQFVTZ9ogVZXxmfpKOe68thkQTtwuVXaokQM=
EOF

# Create Docker override for production
echo "🐳 Creating Docker production configuration..."
cat > docker-compose.yml << EOF
version: '3.8'

services:
  app:
    build: .
    container_name: roguesim-app
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATABASE_URL=postgresql://roguesim_user:nZrdLEehQFVTZ9ogVZXxmfpKOe68thkQTtwuVXaokQM=@db:5432/roguesim_db
      - FRONTEND_URL=https://roguesim.com
      - CORS_ORIGIN=https://roguesim.com,https://www.roguesim.com
      - SENDGRID_API_KEY=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
      - SENDGRID_FROM_EMAIL=uplink@roguesim.com
      - SENDGRID_FROM_NAME=RogueSim
      - SESSION_SECRET=nZrdLEehQFVTZ9ogVZXxmfpKOe68thkQTtwuVXaokQM=
      - COOKIE_DOMAIN=roguesim.com
    ports:
      - "3000:3000"
    depends_on:
      - db
    restart: unless-stopped
    
  db:
    image: postgres:15-alpine
    container_name: roguesim-postgres
    restart: unless-stopped
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    environment:
      - POSTGRES_DB=roguesim_db
      - POSTGRES_USER=roguesim_user
      - POSTGRES_PASSWORD=nZrdLEehQFVTZ9ogVZXxmfpKOe68thkQTtwuVXaokQM=
    ports:
      - "5432:5432"

volumes:
  postgres_data:
EOF

# Update Dockerfile for correct port
echo "🔧 Updating Dockerfile..."
cat > Dockerfile << EOF
# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["npm", "start"]
EOF

# Stop any existing containers
echo "🛑 Stopping existing containers..."
if [ -n "$DOCKER_COMPOSE_CMD" ]; then
    echo "Using command: $DOCKER_COMPOSE_CMD down"
    $DOCKER_COMPOSE_CMD down 2>/dev/null || echo "No existing containers to stop"
else
    echo "❌ Error: DOCKER_COMPOSE_CMD not set"
    exit 1
fi

# Clean up Docker build cache to ensure fresh build
echo "🧹 Cleaning Docker build cache..."
docker system prune -f || echo "Warning: Could not clean Docker cache"

# Remove any existing images to force rebuild
echo "🗑️ Removing existing RogueSim images..."
docker rmi roguesim-app 2>/dev/null || echo "No existing images to remove"

# Start the application
echo "🚀 Starting RogueSim..."
if [ -n "$DOCKER_COMPOSE_CMD" ]; then
    echo "Using command: $DOCKER_COMPOSE_CMD up -d --build"
    $DOCKER_COMPOSE_CMD up -d --build
    
    # Check if build was successful
    if [ $? -eq 0 ]; then
        echo "✅ Build completed successfully"
    else
        echo "❌ Build failed. Checking logs..."
        $DOCKER_COMPOSE_CMD logs app
        exit 1
    fi
else
    echo "❌ Error: DOCKER_COMPOSE_CMD not set"
    exit 1
fi

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check if containers are running
echo "🔍 Checking container status..."
if [ -n "$DOCKER_COMPOSE_CMD" ]; then
    echo "Using command: $DOCKER_COMPOSE_CMD ps"
    $DOCKER_COMPOSE_CMD ps
else
    echo "❌ Error: DOCKER_COMPOSE_CMD not set"
    exit 1
fi

# Create Nginx configuration
echo "🌐 Configuring Nginx..."
cat > /etc/nginx/sites-available/roguesim.com << EOF
server {
    listen 80;
    server_name roguesim.com www.roguesim.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/roguesim.com /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo "🔧 Testing Nginx configuration..."
nginx -t

# Restart Nginx
echo "🔄 Restarting Nginx..."
systemctl restart nginx

# Enable services to start on boot
echo "🔧 Enabling services on boot..."
systemctl enable nginx
systemctl enable docker

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Wait 5-10 minutes for DNS propagation"
echo "2. Test your domain: http://roguesim.com"
echo "3. Run SSL setup: certbot --nginx -d roguesim.com -d www.roguesim.com"
echo ""
echo "🔧 Useful Commands:"
echo "  • Check logs: $DOCKER_COMPOSE_CMD logs -f"
echo "  • Restart app: $DOCKER_COMPOSE_CMD restart"
echo "  • Update app: git pull && $DOCKER_COMPOSE_CMD up -d --build"
echo "  • Check status: $DOCKER_COMPOSE_CMD ps"
echo ""
echo "🌐 Your RogueSim should be available at: http://roguesim.com"
echo "📧 Email configured with: uplink@roguesim.com" 
