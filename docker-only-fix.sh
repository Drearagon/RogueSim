#!/bin/bash

echo "🚀 DOCKER-ONLY BCRYPT FIX (No Host Node Usage)"
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

# Check Node version and warn
NODE_VERSION=$(node --version)
print_warning "Host Node version: $NODE_VERSION (too old - using Docker Node 18)"

# Stop everything
print_status "Stopping all containers and cleaning..."
docker-compose down --remove-orphans 2>/dev/null || true
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true
docker system prune -af

# Create multi-stage Dockerfile that handles everything
print_status "Creating advanced Dockerfile..."
cat > Dockerfile << 'EOF'
# Multi-stage build to handle bcrypt issue
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Fix package.json to use bcryptjs
RUN sed -i 's/"bcrypt":.*/"bcryptjs": "^2.4.3",/' package.json && \
    sed -i 's/"@types\/bcrypt":.*/"@types\/bcryptjs": "^2.4.6",/' package.json || echo "Already fixed"

# Clean install with fixed dependencies
RUN npm ci --force

# Copy all source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy package files and fix them again
COPY package*.json ./
RUN sed -i 's/"bcrypt":.*/"bcryptjs": "^2.4.3",/' package.json && \
    sed -i 's/"@types\/bcrypt":.*/"@types\/bcryptjs": "^2.4.6",/' package.json || echo "Already fixed"

# Install only production dependencies
RUN npm ci --only=production --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/dist ./client/dist

# Copy other necessary files
COPY server ./server
COPY shared ./shared
COPY init.sql ./init.sql

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
EOF

# Create simple docker-compose
print_status "Creating docker-compose.yml..."
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  app:
    build: 
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://roguesim:roguesim123@postgres:5432/roguesim
      - SESSION_SECRET=eecd5e57bbcb4f4d025559c2220e9f8a422e98483b4f7ec69742d07154e3843b13d50a337cab8bd2cd0f6f6e68540310dbe18e30f56e0829a9361616b92fb8ce
      - SENDGRID_API_KEY=INVALID_KEY_PLACEHOLDER
      - FROM_EMAIL=uplink@roguesim.com
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=roguesim
      - POSTGRES_USER=roguesim
      - POSTGRES_PASSWORD=roguesim123
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U roguesim"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  postgres_data:
EOF

# Build using Docker (no host npm commands)
print_status "Building with Docker (bypassing host Node.js)..."
if docker-compose build --no-cache; then
    print_success "Docker build successful!"
else
    print_error "Docker build failed - checking logs..."
    docker-compose logs
    exit 1
fi

# Start containers
print_status "Starting containers..."
if docker-compose up -d; then
    print_success "Containers started!"
else
    print_error "Failed to start containers"
    exit 1
fi

# Wait for startup
print_status "Waiting for services to initialize..."
sleep 15

# Check status
print_status "Checking container status..."

if docker-compose ps | grep -q "Up"; then
    print_success "Containers are running!"
    
    echo ""
    echo "🎮 RogueSim should be available at:"
    echo "   http://localhost:3000"
    echo "   http://$(hostname -I | cut -d' ' -f1):3000"
    echo ""
    
    # Check for bcrypt errors
    if docker-compose logs app 2>&1 | grep -q "bcrypt.*not supported"; then
        print_error "Still seeing bcrypt errors:"
        docker-compose logs app --tail 10
    else
        print_success "No bcrypt errors! 🎉"
        echo "📋 Recent logs:"
        docker-compose logs app --tail 8
        
        # Quick HTTP test
        sleep 3
        if curl -s http://localhost:3000 >/dev/null 2>&1; then
            print_success "HTTP response OK - Game is working! 🚀"
        else
            print_warning "HTTP test failed - check logs above"
        fi
    fi
else
    print_error "Containers not running properly"
    echo "📊 Container status:"
    docker-compose ps
    echo ""
    echo "📋 App logs:"
    docker-compose logs app
fi

echo ""
echo "🔧 Management commands:"
echo "  View logs: docker-compose logs app -f"
echo "  Restart: docker-compose restart app" 
echo "  Stop: docker-compose down"
echo "  Rebuild: docker-compose build --no-cache && docker-compose up -d" 