#!/bin/bash

echo "🚀 RogueSim Server Deployment"
echo "============================"
echo "Server IP: 49.13.197.91"
echo "Domain: roguesim.com"
echo ""

# Set environment variables
echo "🔧 Loading server secrets..."
if [ -f "./server-secrets.conf" ]; then
    source ./server-secrets.conf
    echo "✓ Secrets loaded from server-secrets.conf"
else
    echo "❌ ERROR: server-secrets.conf not found!"
    echo "Please create server-secrets.conf from server-secrets.conf.template"
    echo "and fill in your actual API keys and secrets."
    exit 1
fi

echo "🔧 Setting environment variables..."
# Variables are now loaded from server-secrets.conf above
# DB_PASSWORD, SESSION_SECRET, SENDGRID_API_KEY, PGADMIN_PASSWORD are set from secrets file

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Clean up old images to force rebuild
echo "🧹 Cleaning up old app images..."
docker rmi roguesim-app 2>/dev/null || true
docker system prune -f

# Pull latest code
echo "📥 Pulling latest changes..."
git pull

# Create the final docker-compose.yml with correct settings
echo "📝 Creating docker-compose.yml..."
cat > docker-compose.yml << 'EOF'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://rogueuser:${DB_PASSWORD}@postgres:5432/roguesim
      - SESSION_SECRET=${SESSION_SECRET}
      - SENDGRID_API_KEY=${SENDGRID_API_KEY}
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:15
    container_name: roguesim-postgres
    environment:
      - POSTGRES_DB=roguesim
      - POSTGRES_USER=rogueuser
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    restart: unless-stopped

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: roguesim-pgadmin
    environment:
      - PGADMIN_DEFAULT_EMAIL=uplink@roguesim.com
      - PGADMIN_DEFAULT_PASSWORD=${PGADMIN_PASSWORD}
    ports:
      - "8080:80"
    restart: unless-stopped

volumes:
  postgres_data:
EOF

# Build and start containers
echo "🔨 Building and starting all services..."
docker-compose up -d --build

# Wait for startup
echo "⏳ Waiting for containers to start..."
sleep 10

# Show status
echo ""
echo "📊 Container Status:"
docker-compose ps

echo ""
echo "🎯 Checking app logs..."
docker-compose logs app | tail -10

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "🌐 Access Points:"
echo "• RogueSim App: http://49.13.197.91:3000"
echo "• RogueSim App: https://roguesim.com (if domain configured)"
echo "• pgAdmin: http://49.13.197.91:8080"
echo "  Login: uplink@roguesim.com / roguesim123"
echo ""
echo "🔍 Monitor logs:"
echo "• docker-compose logs app -f"
echo "• docker-compose logs postgres -f"
echo ""
echo "🛑 To stop:"
echo "• docker-compose down" 