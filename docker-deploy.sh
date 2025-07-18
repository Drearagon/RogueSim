#!/bin/bash

# RogueSim Docker Deployment Script
# This script handles the complete Docker deployment process

set -e

echo "🚀 Starting RogueSim Docker deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
if [ ! -f .env ]; then
    print_error ".env file not found!"
    print_status "Creating .env file from template..."
    
    if [ -f env.example ]; then
        cp env.example .env
        print_warning "Please edit the .env file with your actual configuration values:"
        print_warning "- DATABASE_URL (required)"
        print_warning "- SESSION_SECRET (required)"
        print_warning "- SENDGRID_API_KEY (for email verification)"
        print_warning "- STRIPE_SECRET_KEY (for payments)"
        print_warning "- OPENAI_API_KEY (for AI features)"
        exit 1
    else
        print_error "env.example not found. Please create a .env file manually."
        exit 1
    fi
fi

# Validate required environment variables
print_status "Validating environment variables..."
source .env

if [ -z "$DATABASE_URL" ]; then
    print_error "DATABASE_URL is required but not set in .env file"
    exit 1
fi

if [ -z "$SESSION_SECRET" ]; then
    print_error "SESSION_SECRET is required but not set in .env file"
    exit 1
fi

if [ ${#SESSION_SECRET} -lt 32 ]; then
    print_warning "SESSION_SECRET should be at least 32 characters long for security"
fi

print_status "Environment validation passed ✓"

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose down || true

# Remove old images (optional - uncomment if you want to rebuild from scratch)
# print_status "Removing old images..."
# docker-compose down --rmi all || true

# Build and start containers
print_status "Building and starting containers..."
docker-compose up --build -d

# Wait for container to be healthy
print_status "Waiting for container to be healthy..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if docker-compose ps | grep -q "healthy"; then
        print_status "Container is healthy! ✓"
        break
    elif docker-compose ps | grep -q "unhealthy"; then
        print_error "Container is unhealthy!"
        docker-compose logs --tail=50 app
        exit 1
    else
        print_status "Waiting... (attempt $((attempt + 1))/$max_attempts)"
        sleep 10
        attempt=$((attempt + 1))
    fi
done

if [ $attempt -eq $max_attempts ]; then
    print_error "Container failed to become healthy within the timeout period"
    docker-compose logs --tail=50 app
    exit 1
fi

# Test the deployment
print_status "Testing deployment..."
sleep 5

# Test health endpoint
if curl -f http://localhost:8000/api/health > /dev/null 2>&1; then
    print_status "Health check passed ✓"
else
    print_error "Health check failed!"
    docker-compose logs --tail=20 app
    exit 1
fi

# Test frontend
if curl -f http://localhost:8000 > /dev/null 2>&1; then
    print_status "Frontend accessibility test passed ✓"
else
    print_error "Frontend accessibility test failed!"
    docker-compose logs --tail=20 app
    exit 1
fi

print_status "🎉 Deployment successful!"
print_status "RogueSim is now running at: http://localhost:8000"
print_status ""
print_status "Useful commands:"
print_status "  View logs: docker-compose logs -f app"
print_status "  Stop: docker-compose down"
print_status "  Restart: docker-compose restart"
print_status "  View status: docker-compose ps"
print_status ""
print_status "Health check: curl http://localhost:8000/api/health"