#!/bin/bash

# RogueSim Standalone Deployment Script
echo "🚀 RogueSim Standalone Deployment Starting..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📄 Creating .env file from template..."
    cp env.example .env
    
    # Generate a random session secret
    SESSION_SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)
    sed -i "s/your-super-secret-session-key-at-least-32-characters-long/$SESSION_SECRET/" .env
    
    echo "✅ .env file created. You can modify it if needed."
fi

# Stop any running containers
echo "🛑 Stopping any existing containers..."
docker-compose -f docker-compose.standalone.yml down

# Build and start the application
echo "🔨 Building and starting RogueSim..."
docker-compose -f docker-compose.standalone.yml up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check health status
echo "🔍 Checking service health..."
docker-compose -f docker-compose.standalone.yml ps

# Check if services are running
if [ "$(docker-compose -f docker-compose.standalone.yml ps -q | wc -l)" -gt 0 ]; then
    echo "✅ RogueSim is now running!"
    echo ""
    echo "🌐 Access your application at: http://localhost:8000"
    echo "📊 Database: PostgreSQL running on localhost:5432"
    echo ""
    echo "📋 Useful commands:"
    echo "  - View logs: docker-compose -f docker-compose.standalone.yml logs -f"
    echo "  - Stop: docker-compose -f docker-compose.standalone.yml down"
    echo "  - Restart: docker-compose -f docker-compose.standalone.yml restart"
    echo ""
    echo "🎮 Happy hacking!"
else
    echo "❌ Failed to start services. Check logs with:"
    echo "   docker-compose -f docker-compose.standalone.yml logs"
fi