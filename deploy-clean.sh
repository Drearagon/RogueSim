#!/bin/bash

# RogueSim Clean Deployment Script
# Run this on your server after setting environment variables

set -e  # Exit on any error

echo "🚀 RogueSim Production Deployment"
echo "=================================="

# Check for required environment variables
if [ -z "$SENDGRID_API_KEY" ] || [ -z "$SESSION_SECRET" ] || [ -z "$DB_PASSWORD" ]; then
    echo "❌ Missing required environment variables!"
    echo ""
    echo "Please set these first:"
    echo "export SENDGRID_API_KEY='your-sendgrid-key'"
    echo "export SESSION_SECRET='your-session-secret'" 
    echo "export DB_PASSWORD='your-db-password'"
    echo ""
    exit 1
fi

# Update system
echo "📦 Updating system..."
sudo apt update && sudo apt upgrade -y

# Install Docker if needed
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
fi

# Install Docker Compose if needed
if ! command -v docker-compose &> /dev/null; then
    echo "🔧 Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.36.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Clone/update repo
if [ ! -d "RogueSim" ]; then
    echo "📥 Cloning repository..."
    git clone https://github.com/Drearagon/RogueSim.git
    cd RogueSim
else
    echo "📥 Updating repository..."
    cd RogueSim
    git pull origin main
fi

# Create production environment file
echo "⚙️ Creating production environment..."
cat > .env << EOF
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://roguesim_user:${DB_PASSWORD}@db:5432/roguesim_db
FRONTEND_URL=https://roguesim.com
CORS_ORIGIN=https://roguesim.com,https://www.roguesim.com
SENDGRID_API_KEY=${SENDGRID_API_KEY}
SENDGRID_FROM_EMAIL=uplink@roguesim.com
SENDGRID_FROM_NAME=RogueSim
SESSION_SECRET=${SESSION_SECRET}
COOKIE_DOMAIN=roguesim.com
POSTGRES_DB=roguesim_db
POSTGRES_USER=roguesim_user
POSTGRES_PASSWORD=${DB_PASSWORD}
EOF

# Create fixed Dockerfile
echo "🔧 Creating fixed Dockerfile..."
cat > Dockerfile << EOF
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --production
EXPOSE 3000
CMD ["node", "dist/index.js"]
EOF

# Create docker-compose configuration
echo "🐳 Creating Docker Compose config..."
cat > docker-compose.yml << EOF
services:
  app:
    build: .
    container_name: roguesim-app
    env_file: .env
    ports:
      - "3000:3000"
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    container_name: roguesim-db
    env_file: .env
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
EOF

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Clean Docker cache
echo "🧹 Cleaning build cache..."
docker system prune -f

# Build and start
echo "🚀 Building and starting RogueSim..."
docker-compose up -d --build

echo ""
echo "✅ Deployment complete!"
echo "🌐 RogueSim should be running on port 3000"
echo "📊 Check logs: docker-compose logs -f"
echo "🔍 Check status: docker-compose ps" 