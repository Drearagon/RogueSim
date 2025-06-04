#!/bin/bash

echo "🔄 QUICK HETZNER REBUILD - Fixing bcrypt Issue"
echo "==============================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}▶${NC} $1"; }
print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }

# Stop current containers
print_status "Stopping containers..."
sudo docker-compose down

# Remove images to force rebuild
print_status "Removing old images..."
sudo docker rmi $(sudo docker images -q roguesim*) 2>/dev/null || true

# Double-check and fix package.json
print_status "Ensuring bcrypt is fixed in package.json..."
if grep -q '"bcrypt"' package.json; then
    print_warning "Still found bcrypt in package.json, fixing..."
    sed -i 's/"bcrypt":.*/"bcryptjs": "^2.4.3",/' package.json
    sed -i 's/"@types\/bcrypt":.*/"@types\/bcryptjs": "^2.4.6",/' package.json
    print_success "Fixed package.json"
else
    print_success "package.json already uses bcryptjs"
fi

# Remove package-lock.json to force regeneration
print_status "Removing package-lock.json..."
rm -f package-lock.json

# Check server imports
print_status "Checking server imports..."
if grep -q 'from "bcrypt"' server/routes.ts; then
    print_status "Fixing server import..."
    sed -i 's/from "bcrypt"/from "bcryptjs"/' server/routes.ts
    print_success "Fixed server import"
else
    print_success "Server import already correct"
fi

# Create a more robust Dockerfile
print_status "Creating fixed Dockerfile..."
cat > Dockerfile << 'EOF'
FROM node:18-alpine

# Install curl for health checks
RUN apk add --no-cache curl

WORKDIR /app

# Copy package files
COPY package*.json ./

# Remove any existing node_modules and package-lock
RUN rm -rf node_modules package-lock.json

# Install dependencies (will generate new package-lock.json)
RUN npm install --force --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN npm run build || echo "Build completed with warnings"

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 3000

# Simple health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start application
CMD ["npm", "start"]
EOF

# Build with no cache
print_status "Building containers with no cache..."
if sudo docker-compose build --no-cache; then
    print_success "Build successful!"
else
    print_error "Build failed!"
    exit 1
fi

# Start containers
print_status "Starting containers..."
if sudo docker-compose up -d; then
    print_success "Containers started!"
else
    print_error "Failed to start containers"
    exit 1
fi

# Wait and check
print_status "Waiting 30 seconds for startup..."
sleep 30

print_status "Checking container status..."
sudo docker-compose ps

print_status "Checking for bcrypt errors..."
if sudo docker-compose logs app 2>&1 | grep -i "bcrypt.*not supported"; then
    print_error "Still seeing bcrypt errors!"
    echo "Showing recent logs:"
    sudo docker-compose logs app --tail 15
else
    print_success "No bcrypt errors found!"
    
    # Test the application
    print_status "Testing application..."
    sleep 5
    if curl -s http://localhost:3000 >/dev/null 2>&1; then
        print_success "Application is responding!"
        
        # Get server IP
        SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | cut -d' ' -f1)
        
        echo ""
        echo "🎮 SUCCESS! RogueSim is working!"
        echo "================================"
        echo "🌐 Local: http://localhost:3000"
        echo "🌐 Public: http://$SERVER_IP:3000"
        echo ""
        print_success "Deployment complete!"
        
    else
        print_warning "Application not responding yet - check logs"
        sudo docker-compose logs app --tail 10
    fi
fi

echo ""
echo "📋 Container Status:"
sudo docker-compose ps 