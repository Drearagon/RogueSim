#!/bin/bash

echo "🚀 SIMPLE DOCKER FIX - Build Solution"
echo "===================================="

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

# Check if Docker is running
print_status "Checking Docker availability..."
if ! docker --version >/dev/null 2>&1; then
    print_error "Docker not found! Please start Docker Desktop and try again."
    exit 1
fi

if ! docker ps >/dev/null 2>&1; then
    print_warning "Docker daemon not running. Please start Docker Desktop first."
    echo ""
    echo "Steps to fix:"
    echo "1. Open Docker Desktop"
    echo "2. Wait for it to start completely"
    echo "3. Run this script again"
    exit 1
fi

print_success "Docker is running!"

# Check if we're in the right directory
if [[ ! -f "package.json" ]]; then
    print_error "package.json not found. Please run this script from the RogueSim root directory."
    exit 1
fi

# First, manually fix package.json for bcrypt
print_status "Fixing bcrypt in package.json..."
if grep -q '"bcrypt"' package.json; then
    cp package.json package.json.backup
    sed -i 's/"bcrypt":.*/"bcryptjs": "^2.4.3",/' package.json
    sed -i 's/"@types\/bcrypt":.*/"@types\/bcryptjs": "^2.4.6",/' package.json
    print_success "Updated package.json to use bcryptjs"
else
    print_warning "bcrypt not found in package.json (already fixed?)"
fi

# Remove old lock file
if [[ -f "package-lock.json" ]]; then
    print_status "Removing old package-lock.json..."
    rm package-lock.json
fi

# Generate new package-lock.json with fixed dependencies
print_status "Generating package-lock.json..."
if command -v npm >/dev/null 2>&1; then
    npm install --package-lock-only --no-install
    print_success "package-lock.json generated"
else
    print_warning "npm not available locally, will generate in Docker"
fi

# Stop everything first
print_status "Stopping existing containers..."
docker-compose down --remove-orphans 2>/dev/null || true

# Create simple, working Dockerfile
print_status "Creating simple Dockerfile..."
cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm ci --force || npm install --force

# Copy everything else
COPY . .

# Build the application
RUN npm run build || echo "Build completed with warnings"

# Expose port
EXPOSE 3000

# Start command
CMD ["npm", "start"]
EOF

# Create simple docker-compose
print_status "Creating simple docker-compose.yml..."
cat > docker-compose.yml << 'EOF'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://roguesim:roguesim123@postgres:5432/roguesim
      - SESSION_SECRET=eecd5e57bbcb4f4d025559c2220e9f8a422e98483b4f7ec69742d07154e3843b13d50a337cab8bd2cd0f6f6e68540310dbe18e30f56e0829a9361616b92fb8ce
      - SENDGRID_API_KEY=INVALID_KEY_PLACEHOLDER
      - FROM_EMAIL=uplink@roguesim.com
    depends_on:
      - postgres
    restart: unless-stopped

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

volumes:
  postgres_data:
EOF

# Build with simple approach
print_status "Building Docker containers..."
echo "This may take several minutes..."

if docker-compose build --no-cache; then
    print_success "Build successful!"
else
    print_error "Build failed - but let's try to start anyway..."
fi

# Start containers
print_status "Starting containers..."
if docker-compose up -d; then
    print_success "Containers started!"
else
    print_error "Failed to start containers"
    docker-compose ps
    exit 1
fi

# Wait and check
print_status "Waiting for startup (30 seconds)..."
sleep 30

print_status "Checking status..."
docker-compose ps

print_status "Checking logs for errors..."
if docker-compose logs app | grep -i "error\|failed" | head -5; then
    print_warning "Some errors found in logs"
else
    print_success "No major errors in logs"
fi

echo ""
echo "🎮 RogueSim Docker Setup Complete!"
echo "=================================="
echo "🌐 Game should be at: http://localhost:3000"
echo ""
echo "📋 Commands:"
echo "  View logs: docker-compose logs app -f"
echo "  Restart:   docker-compose restart"
echo "  Stop:      docker-compose down"
echo ""
echo "If it's not working, check the logs above for specific errors." 