#!/bin/bash

echo "🔧 RogueSim bcrypt Fix & Docker Rebuild Script"
echo "==============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}▶${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Step 1: Stop any running containers
print_status "Stopping existing Docker containers..."
docker-compose down 2>/dev/null || true
docker stop $(docker ps -q) 2>/dev/null || true
print_success "Containers stopped"

# Step 2: Remove old Docker images to force rebuild
print_status "Removing old Docker images..."
docker rmi roguesim 2>/dev/null || true
docker rmi $(docker images --filter "dangling=true" -q) 2>/dev/null || true
print_success "Old images removed"

# Step 3: Install new dependencies
print_status "Installing bcryptjs and removing bcrypt..."

# Remove bcrypt and install bcryptjs
npm uninstall bcrypt @types/bcrypt 2>/dev/null || true
npm install bcryptjs@2.4.3 @types/bcryptjs@2.4.6

print_success "Dependencies updated"

# Step 4: Clear npm cache
print_status "Clearing npm cache..."
npm cache clean --force
print_success "Cache cleared"

# Step 5: Build fresh Docker image
print_status "Building Docker image..."
if docker build -t roguesim . --no-cache; then
    print_success "Docker image built successfully"
else
    print_error "Docker build failed"
    exit 1
fi

# Step 6: Run the container
print_status "Starting RogueSim container..."
if docker run -d --name roguesim-app -p 3000:3000 -p 5001:5000 roguesim; then
    print_success "Container started successfully"
else
    print_error "Failed to start container"
    exit 1
fi

# Step 7: Wait a moment and check status
sleep 3
print_status "Checking container status..."

if docker ps | grep roguesim-app > /dev/null; then
    print_success "Container is running!"
    echo ""
    echo "🎮 RogueSim is now available at:"
    echo "   http://localhost:3000"
    echo ""
    echo "📊 Container status:"
    docker ps --filter name=roguesim-app
    echo ""
    echo "📋 Container logs (last 10 lines):"
    docker logs roguesim-app --tail 10
else
    print_error "Container is not running. Checking logs..."
    docker logs roguesim-app
    exit 1
fi

# Step 8: Health check
print_status "Performing health check..."
sleep 5

if curl -s http://localhost:3000 > /dev/null; then
    print_success "Health check passed - RogueSim is responding!"
else
    print_warning "Health check failed - container may still be starting..."
    echo "Check logs with: docker logs roguesim-app"
fi

echo ""
echo "🚀 Deployment complete!"
echo "   Game: http://localhost:3000"
echo "   Logs: docker logs roguesim-app -f"
echo "   Stop: docker stop roguesim-app" 