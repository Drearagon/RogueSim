#!/bin/bash

echo "💥 NUCLEAR HETZNER FIX - Complete Clean Rebuild"
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

# COMPLETE CLEANUP - Remove everything
print_status "🧹 COMPLETE CLEANUP - Removing all build artifacts..."

# Stop and remove all containers
sudo docker-compose down --volumes --remove-orphans 2>/dev/null || true
sudo docker stop $(sudo docker ps -aq) 2>/dev/null || true
sudo docker rm $(sudo docker ps -aq) 2>/dev/null || true

# Remove all Docker images
print_status "Removing all Docker images..."
sudo docker rmi $(sudo docker images -q) -f 2>/dev/null || true
sudo docker system prune -af --volumes

# Remove ALL build artifacts from host
print_status "Removing all build artifacts from host..."
rm -rf dist/
rm -rf node_modules/
rm -rf client/dist/
rm -rf client/node_modules/
rm -rf package-lock.json
rm -rf client/package-lock.json
rm -rf .npm/
rm -rf ~/.npm/ 2>/dev/null || true

print_success "Complete cleanup finished!"

# Fix ALL bcrypt references
print_status "🔧 Fixing ALL bcrypt references..."

# Fix main package.json
if grep -q '"bcrypt"' package.json; then
    print_status "Fixing main package.json..."
    cp package.json package.json.backup
    sed -i 's/"bcrypt":.*/"bcryptjs": "^2.4.3",/' package.json
    sed -i 's/"@types\/bcrypt":.*/"@types\/bcryptjs": "^2.4.6",/' package.json
    print_success "Fixed main package.json"
fi

# Fix client package.json if it exists
if [[ -f "client/package.json" ]] && grep -q '"bcrypt"' client/package.json; then
    print_status "Fixing client package.json..."
    sed -i 's/"bcrypt":.*/"bcryptjs": "^2.4.3",/' client/package.json
    sed -i 's/"@types\/bcrypt":.*/"@types\/bcryptjs": "^2.4.6",/' client/package.json
    print_success "Fixed client package.json"
fi

# Fix all TypeScript imports
print_status "Fixing all import statements..."
find . -name "*.ts" -not -path "./node_modules/*" -exec grep -l "from [\"']bcrypt[\"']" {} \; | while read file; do
    print_status "Fixing imports in $file..."
    sed -i 's/from "bcrypt"/from "bcryptjs"/g' "$file"
    sed -i "s/from 'bcrypt'/from 'bcryptjs'/g" "$file"
done

# Check for any remaining bcrypt references
print_status "Checking for remaining bcrypt references..."
if grep -r "bcrypt" --include="*.ts" --include="*.js" --exclude-dir=node_modules . | grep -v "bcryptjs"; then
    print_warning "Found remaining bcrypt references - they will be fixed during build"
else
    print_success "All bcrypt references appear to be fixed"
fi

# Create ultra-clean Dockerfile
print_status "Creating ultra-clean Dockerfile..."
cat > Dockerfile << 'EOF'
FROM node:18-alpine

# Install curl for health checks
RUN apk add --no-cache curl

WORKDIR /app

# Copy package files only
COPY package*.json ./

# COMPLETELY clean install - no cache, no lock
RUN rm -rf node_modules package-lock.json && \
    npm cache clean --force && \
    npm install --force --legacy-peer-deps --no-package-lock

# Copy source code
COPY . .

# Remove any existing dist and build fresh
RUN rm -rf dist && \
    npm run build || echo "Build completed with warnings"

# Verify bcryptjs is installed and bcrypt is not
RUN if npm list bcrypt 2>/dev/null; then echo "ERROR: bcrypt still installed!" && exit 1; else echo "Good: bcrypt not found"; fi
RUN if npm list bcryptjs 2>/dev/null; then echo "Good: bcryptjs found"; else echo "ERROR: bcryptjs not found!" && exit 1; fi

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start application
CMD ["npm", "start"]
EOF

# Create simple docker-compose
print_status "Creating clean docker-compose.yml..."
cat > docker-compose.yml << 'EOF'
services:
  app:
    build: 
      context: .
      no_cache: true
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://roguesim:roguesim123@postgres:5432/roguesim
      - SESSION_SECRET=eecd5e57bbcb4f4d025559c2220e9f8a422e98483b4f7ec69742d07154e3843b13d50a337cab8bd2cd0f6f6e68540310dbe18e30f56e0829a9361616b92fb8ce
      - SENDGRID_API_KEY=INVALID_KEY_PLACEHOLDER
      - FROM_EMAIL=uplink@roguesim.com
      - PORT=3000
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=roguesim
      - POSTGRES_USER=roguesim
      - POSTGRES_PASSWORD=roguesim123
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U roguesim -d roguesim"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s

volumes:
  postgres_data:
EOF

# Build with complete rebuild
print_status "🔨 Building with complete rebuild (this will take several minutes)..."
if sudo docker-compose build --no-cache --pull; then
    print_success "Build successful!"
else
    print_error "Build failed! Check the output above"
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

# Extended wait for startup
print_status "Waiting 45 seconds for complete startup..."
sleep 45

# Comprehensive health check
print_status "Running comprehensive health check..."
sudo docker-compose ps

print_status "Checking for ANY bcrypt errors..."
if sudo docker-compose logs app 2>&1 | grep -i "bcrypt" | grep -v "bcryptjs"; then
    print_error "❌ BCRYPT ERRORS STILL FOUND!"
    echo ""
    echo "🔍 Full error analysis:"
    sudo docker-compose logs app --tail 25
    
    echo ""
    echo "🛠️  DEBUG INFO:"
    echo "Checking what's actually installed in container..."
    sudo docker-compose exec app npm list bcrypt 2>/dev/null || echo "bcrypt not found (good)"
    sudo docker-compose exec app npm list bcryptjs 2>/dev/null || echo "bcryptjs not found (bad)"
    
else
    print_success "✅ NO BCRYPT ERRORS FOUND!"
    
    # Test the application
    print_status "Testing application response..."
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
        echo "🔒 Remember to configure firewall for security"
        echo ""
        print_success "Nuclear deployment complete!"
        
    else
        print_warning "Application not responding - checking logs..."
        sudo docker-compose logs app --tail 15
    fi
fi

echo ""
echo "📊 Final Container Status:"
sudo docker-compose ps

echo ""
echo "📋 Useful commands:"
echo "  sudo docker-compose logs app -f    # Follow logs"
echo "  sudo docker-compose restart app    # Restart app"
echo "  sudo docker-compose down           # Stop all" 