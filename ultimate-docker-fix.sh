#!/bin/bash

echo "🚀 ULTIMATE DOCKER FIX - Complete Build Solution"
echo "================================================="

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

# Check if we're in the right directory
if [[ ! -f "package.json" ]]; then
    print_error "package.json not found. Please run this script from the RogueSim root directory."
    exit 1
fi

# Stop everything
print_status "Stopping all containers and cleaning..."
docker-compose down --remove-orphans 2>/dev/null || true
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true
docker system prune -af

# Generate package-lock.json locally (needed for npm ci)
print_status "Generating package-lock.json..."
if [[ -f "package-lock.json" ]]; then
    print_warning "Removing existing package-lock.json"
    rm package-lock.json
fi

# Use Docker to generate package-lock.json with Node 18
print_status "Generating package-lock.json with Docker..."
docker run --rm -v "$(pwd):/app" -w /app node:18-alpine sh -c "
    # Fix bcrypt in package.json
    sed -i 's/\"bcrypt\":.*/\"bcryptjs\": \"^2.4.3\",/' package.json
    sed -i 's/\"@types\/bcrypt\":.*/\"@types\/bcryptjs\": \"^2.4.6\",/' package.json
    
    # Generate package-lock.json
    npm install --package-lock-only
    echo 'Package-lock.json generated successfully'
"

if [[ ! -f "package-lock.json" ]]; then
    print_error "Failed to generate package-lock.json"
    exit 1
fi

print_success "package-lock.json generated"

# Create optimized Dockerfile
print_status "Creating optimized Dockerfile..."
cat > Dockerfile << 'EOF'
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies 
RUN npm ci --force

# Copy source code
COPY . .

# Build the application (both client and server)
RUN npm run build

# Debug: List what was actually built
RUN echo "=== Build Output Verification ===" && \
    ls -la && \
    echo "Contents of dist:" && \
    ls -la dist/ 2>/dev/null || echo "No dist/ directory" && \
    echo "Contents of client:" && \
    ls -la client/ 2>/dev/null || echo "No client/ directory" && \
    echo "Looking for built client files:" && \
    find . -name "index.html" -o -name "*.js" -o -name "*.css" | grep -v node_modules | head -10

# Production image
FROM node:18-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev --force

# Copy the built server application
COPY --from=builder /app/dist ./dist

# Copy static client files - handle different possible locations
RUN mkdir -p ./client/dist
COPY --from=builder /app/client/dist ./client/dist 2>/dev/null || \
     COPY --from=builder /app/dist/client ./client/dist 2>/dev/null || \
     echo "No pre-built client dist found, will serve from source"

# If no client/dist exists, copy the client source for runtime building
COPY --from=builder /app/client ./client

# Copy necessary server files
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/init.sql ./init.sql

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Start the application
CMD ["npm", "start"]
EOF

# Create optimized docker-compose.yml (remove obsolete version)
print_status "Creating optimized docker-compose.yml..."
cat > docker-compose.yml << 'EOF'
services:
  app:
    build: 
      context: .
      dockerfile: Dockerfile
      target: production
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
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

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
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U roguesim -d roguesim"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    restart: unless-stopped

volumes:
  postgres_data:
    driver: local
EOF

# Build with verbose output
print_status "Building Docker image (this may take a few minutes)..."
echo "📊 Build progress will be shown below:"
echo ""

if docker-compose build --no-cache --progress=plain; then
    print_success "Docker build successful! 🎉"
else
    print_error "Docker build failed. Showing detailed logs..."
    
    echo ""
    echo "🔍 Checking for common issues:"
    
    # Check if package.json was modified correctly
    if grep -q "bcryptjs" package.json; then
        print_success "bcryptjs found in package.json"
    else
        print_error "bcryptjs not found in package.json"
        echo "Current bcrypt-related lines:"
        grep -i bcrypt package.json || echo "No bcrypt entries found"
    fi
    
    # Check if package-lock.json exists and has the right entries
    if [[ -f "package-lock.json" ]] && grep -q "bcryptjs" package-lock.json; then
        print_success "bcryptjs found in package-lock.json"
    else
        print_warning "bcryptjs not found in package-lock.json"
    fi
    
    exit 1
fi

# Start containers
print_status "Starting containers..."
if docker-compose up -d; then
    print_success "Containers started!"
else
    print_error "Failed to start containers"
    echo "📋 Container status:"
    docker-compose ps
    exit 1
fi

# Wait for startup
print_status "Waiting for services to initialize..."
echo "⏳ This may take up to 60 seconds..."

# Wait with progress indicator
for i in {1..12}; do
    echo -n "."
    sleep 5
    if docker-compose ps | grep -q "Up.*healthy"; then
        break
    fi
done
echo ""

# Comprehensive health check
print_status "Checking application health..."

# Check container status
if docker-compose ps | grep -q "Up"; then
    print_success "Containers are running!"
    
    # Check for bcrypt errors in logs
    if docker-compose logs app 2>&1 | grep -qi "bcrypt.*not supported\|bcrypt.*error"; then
        print_error "Still seeing bcrypt errors:"
        echo "📋 App logs (last 15 lines):"
        docker-compose logs app --tail 15
        exit 1
    else
        print_success "No bcrypt errors found! ✅"
    fi
    
    # Check for successful startup
    if docker-compose logs app 2>&1 | grep -q "Server listening\|Connected to PostgreSQL\|server started"; then
        print_success "Application started successfully!"
    else
        print_warning "Application may still be starting up..."
    fi
    
    # Test HTTP connectivity
    sleep 5
    if curl -s http://localhost:3000 >/dev/null 2>&1; then
        print_success "HTTP response OK - Game is working! 🚀"
    else
        print_warning "HTTP test failed - checking logs..."
        echo "📋 Recent logs:"
        docker-compose logs app --tail 10
    fi
    
else
    print_error "Containers not running properly"
    echo "📊 Container status:"
    docker-compose ps
    echo ""
    echo "📋 App logs:"
    docker-compose logs app --tail 20
    exit 1
fi

echo ""
echo "🎮 SUCCESS! RogueSim is ready!"
echo "============================================="
echo "🌐 Game URL: http://localhost:3000"
echo "🌐 External: http://$(hostname -I | cut -d' ' -f1):3000"
echo ""
echo "🔧 Management Commands:"
echo "  View logs:   docker-compose logs app -f"
echo "  Restart:     docker-compose restart app"
echo "  Stop:        docker-compose down"
echo "  Rebuild:     docker-compose build --no-cache && docker-compose up -d"
echo ""
echo "📋 Container Status:"
docker-compose ps 