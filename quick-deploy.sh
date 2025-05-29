#!/bin/bash

echo "🚀 RogueSim Quick Deploy"
echo "======================="

# Pull latest changes
echo "📥 Pulling latest code..."
git pull

# Use the clean compose file
echo "🔄 Copying docker-compose configuration..."
cp docker-compose-fixed.yml docker-compose.yml

# Set environment variables (user should set these beforehand)
export DB_PASSWORD=${DB_PASSWORD:-"your_db_password_here"}
export SESSION_SECRET=${SESSION_SECRET:-"your_session_secret_here"}
export SENDGRID_API_KEY=${SENDGRID_API_KEY:-"your_sendgrid_key_here"}
export PGADMIN_PASSWORD=${PGLADMIN_PASSWORD:-"roguesim123"}

# Stop and restart containers
echo "🛑 Stopping existing containers..."
docker-compose down

echo "🔨 Building and starting containers..."
docker-compose up -d --build

# Show status
echo ""
echo "📊 Container Status:"
docker-compose ps

echo ""
echo "🎯 View logs with:"
echo "docker-compose logs -f"

echo ""
echo "🌐 Access points:"
echo "• App: http://localhost:3000"
echo "• pgAdmin: http://localhost:8080 (uplink@roguesim.com)" 