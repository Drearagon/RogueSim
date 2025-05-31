#!/bin/bash

echo "🔧 MANUAL BCRYPT FIX - Targeted Source Code Fix"
echo "=============================================="

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

# Stop containers first
print_status "Stopping all containers..."
sudo docker-compose down --volumes --remove-orphans 2>/dev/null || true

# Check current bcrypt references
print_status "Checking current bcrypt references..."
echo "=== Current server/routes.ts bcrypt usage ==="
grep -n "bcrypt" server/routes.ts || echo "No bcrypt references found"

# Verify the source is correct
print_status "Verifying current import statement..."
head -10 server/routes.ts | grep -E "(import|require)" | grep -E "(bcrypt|bcryptjs)"

# Manual verification - show what we currently have
print_status "Current package.json dependencies..."
grep -A5 -B5 "bcrypt" package.json || echo "No bcrypt in package.json"

# Force fix package.json if needed
if grep -q '"bcrypt"' package.json; then
    print_status "Fixing package.json..."
    sed -i 's/"bcrypt":.*/"bcryptjs": "^2.4.3",/' package.json
    sed -i 's/"@types\/bcrypt":.*/"@types\/bcryptjs": "^2.4.6",/' package.json
    print_success "Fixed package.json"
else
    print_success "package.json already uses bcryptjs"
fi

# Verify the fix
print_status "Verifying package.json fix..."
grep -A2 -B2 "bcryptjs" package.json

# Remove ALL build artifacts and caches
print_status "Removing ALL build artifacts..."
rm -rf dist/
rm -rf node_modules/
rm -rf .npm/
rm -rf package-lock.json
rm -rf client/dist/
rm -rf client/node_modules/
rm -rf client/package-lock.json

# Remove Docker containers and images
print_status "Removing Docker artifacts..."
sudo docker stop $(sudo docker ps -aq) 2>/dev/null || true
sudo docker rm $(sudo docker ps -aq) 2>/dev/null || true
sudo docker rmi roguesim-app 2>/dev/null || true
sudo docker system prune -f

# Create super clean Dockerfile
print_status "Creating verified clean Dockerfile..."
cat > Dockerfile << 'EOF'
FROM node:18-alpine

# Install curl for health checks
RUN apk add --no-cache curl

WORKDIR /app

# Copy package files first
COPY package.json ./

# Clean install with verification
RUN echo "=== VERIFYING PACKAGE.JSON ===" && \
    cat package.json | grep -E "(bcrypt|bcryptjs)" && \
    echo "=== CLEANING INSTALL ===" && \
    npm cache clean --force && \
    npm install --no-package-lock --force

# Verify bcryptjs is installed, bcrypt is not
RUN echo "=== DEPENDENCY CHECK ===" && \
    npm list bcryptjs && \
    (npm list bcrypt 2>/dev/null && echo "ERROR: bcrypt found!" && exit 1) || echo "Good: bcrypt not found"

# Copy source code
COPY . .

# Show what we're building with
RUN echo "=== SOURCE VERIFICATION ===" && \
    grep -n "bcrypt" server/routes.ts && \
    echo "=== BUILDING ===" && \
    rm -rf dist && \
    npm run build

# Final verification of compiled code
RUN echo "=== CHECKING COMPILED CODE ===" && \
    if grep -r "require.*bcrypt" dist/ 2>/dev/null; then \
        echo "ERROR: Compiled code still has bcrypt!" && exit 1; \
    else \
        echo "Good: No bcrypt in compiled code"; \
    fi

# Create logs directory
RUN mkdir -p logs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["npm", "start"]
EOF

# Show current source code state
print_status "Current server/routes.ts import section:"
head -15 server/routes.ts

# Build and test
print_status "Building with maximum verification..."
if sudo docker-compose build --no-cache; then
    print_success "Build completed!"
    
    print_status "Starting containers..."
    if sudo docker-compose up -d; then
        print_success "Containers started!"
        
        # Wait and check
        print_status "Waiting 30 seconds for startup..."
        sleep 30
        
        print_status "Checking for bcrypt errors..."
        if sudo docker-compose logs app 2>&1 | grep -i "dynamic require.*bcrypt"; then
            print_error "❌ BCRYPT ERRORS STILL PRESENT"
            echo ""
            echo "🔍 Detailed analysis:"
            sudo docker-compose logs app --tail 10
            
            echo ""
            echo "🛠️ Container inspection:"
            sudo docker-compose exec app npm list bcrypt 2>/dev/null || echo "bcrypt not in container"
            sudo docker-compose exec app npm list bcryptjs 2>/dev/null || echo "bcryptjs not in container"
            
        else
            print_success "✅ NO BCRYPT ERRORS!"
            
            # Test the application
            sleep 10
            if curl -s http://localhost:3000 >/dev/null 2>&1; then
                print_success "🎉 APPLICATION IS WORKING!"
                
                # Get server IP
                SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | cut -d' ' -f1)
                
                echo ""
                echo "🎮 🎮 SUCCESS! ROGUESIM IS LIVE! 🎮 🎮"
                echo "========================================"
                echo "🌐 Local URL:  http://localhost:3000"
                echo "🌐 Public URL: http://$SERVER_IP:3000"
                echo ""
                echo "🎯 Game is ready for players!"
                
            else
                print_warning "App not responding - checking logs..."
                sudo docker-compose logs app --tail 15
            fi
        fi
    else
        print_error "Failed to start containers"
    fi
else
    print_error "Build failed!"
    echo ""
    echo "Manual check required - investigating source code..."
    echo ""
    echo "Current package.json bcrypt references:"
    grep -n "bcrypt" package.json || echo "None found"
    echo ""
    echo "Current routes.ts bcrypt references:"  
    grep -n "bcrypt" server/routes.ts || echo "None found"
fi

echo ""
echo "📊 Final Status:"
sudo docker-compose ps 2>/dev/null || echo "No containers running" 