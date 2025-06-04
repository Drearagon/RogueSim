cd /opt/roguesim/RogueSim

# First, let's see what's actually in the source
echo "=== Checking current state ==="
grep -n "bcrypt" server/routes.ts
grep -n "bcrypt" package.json

# Create the manual fix script
cat > manual-bcrypt-fix.sh << 'EOF'
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

# Stop containers
print_status "Stopping containers..."
sudo docker-compose down --volumes

# Show current problematic code
print_status "Current source code state..."
echo "=== server/routes.ts bcrypt references ==="
grep -n "bcrypt" server/routes.ts

# Remove ALL build artifacts
print_status "Nuclear cleanup..."
rm -rf dist/ node_modules/ package-lock.json client/dist/ client/node_modules/ client/package-lock.json
sudo docker system prune -af

# Create minimal test Dockerfile
print_status "Creating test Dockerfile..."
cat > Dockerfile << 'DOCKEREOF'
FROM node:18-alpine
RUN apk add --no-cache curl
WORKDIR /app
COPY package.json ./
RUN echo "=== PACKAGE.JSON CHECK ===" && \
    grep -E "(bcrypt|bcryptjs)" package.json && \
    npm install --no-package-lock
RUN echo "=== DEPENDENCY VERIFICATION ===" && \
    npm list bcryptjs && \
    (npm list bcrypt && exit 1) || echo "Good: bcrypt not found"
COPY . .
RUN echo "=== SOURCE CHECK ===" && \
    grep -n "bcrypt" server/routes.ts && \
    npm run build && \
    echo "=== COMPILED CHECK ===" && \
    (grep -r "require.*bcrypt" dist/ && exit 1) || echo "Good: No bcrypt in compiled code"
RUN mkdir -p logs
EXPOSE 3000
CMD ["npm", "start"]
DOCKEREOF

# Build with full visibility
print_status "Building with verification..."
sudo docker-compose build --no-cache

print_status "Starting containers..."
sudo docker-compose up -d

sleep 30

print_status "Final check..."
if sudo docker-compose logs app | grep -i "dynamic require.*bcrypt"; then
    print_error "BCRYPT STILL PRESENT - need manual investigation"
    sudo docker-compose logs app --tail 20
else
    print_success "BCRYPT FIXED!"
    curl -s http://localhost:3000 && echo "✅ App working!"
fi
EOF
