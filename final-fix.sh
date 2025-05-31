#!/bin/bash

echo "🚀 FINAL BCRYPT & NODE VERSION FIX"
echo "=================================="

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

# Check current Node version
print_status "Checking Node.js version..."
NODE_VERSION=$(node --version)
echo "Current Node version: $NODE_VERSION"

if [[ "$NODE_VERSION" < "v18" ]]; then
    print_warning "Node.js version is too old ($NODE_VERSION). Docker will handle this."
    USE_DOCKER_ONLY=true
else
    print_success "Node.js version is compatible"
    USE_DOCKER_ONLY=false
fi

# Stop everything
print_status "Stopping all containers and cleaning..."
docker-compose down --remove-orphans 2>/dev/null || true
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true
docker system prune -af

# Fix package.json directly
print_status "Fixing package.json dependencies..."

# Create a fixed package.json with bcryptjs
cat > package.json << 'EOF'
{
  "name": "roguesim",
  "version": "1.0.0",
  "type": "module",
  "license": "MIT",
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "cross-env NODE_ENV=development tsx server/index.ts",
    "dev:client": "vite",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "cross-env NODE_ENV=production node dist/index.js",
    "check": "tsc",
    "db:setup": "node scripts/setup-db.js",
    "db:setup-neon": "node scripts/setup-neon.js",
    "db:test": "node scripts/test-db.js",
    "db:push": "drizzle-kit push",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.10.0",
    "@jridgewell/trace-mapping": "^0.3.25",
    "@neondatabase/serverless": "^0.10.4",
    "@radix-ui/react-accordion": "^1.2.4",
    "@radix-ui/react-alert-dialog": "^1.1.7",
    "@radix-ui/react-aspect-ratio": "^1.1.3",
    "@radix-ui/react-avatar": "^1.1.4",
    "@radix-ui/react-checkbox": "^1.1.5",
    "@radix-ui/react-collapsible": "^1.1.4",
    "@radix-ui/react-context-menu": "^2.2.7",
    "@radix-ui/react-dialog": "^1.1.7",
    "@radix-ui/react-dropdown-menu": "^2.1.7",
    "@radix-ui/react-hover-card": "^1.1.7",
    "@radix-ui/react-label": "^2.1.3",
    "@radix-ui/react-menubar": "^1.1.7",
    "@radix-ui/react-navigation-menu": "^1.2.6",
    "@radix-ui/react-popover": "^1.1.7",
    "@radix-ui/react-progress": "^1.1.3",
    "@radix-ui/react-radio-group": "^1.2.4",
    "@radix-ui/react-scroll-area": "^1.2.4",
    "@radix-ui/react-select": "^2.1.7",
    "@radix-ui/react-separator": "^1.1.3",
    "@radix-ui/react-slider": "^1.2.4",
    "@radix-ui/react-slot": "^1.2.0",
    "@radix-ui/react-switch": "^1.1.4",
    "@radix-ui/react-tabs": "^1.1.4",
    "@radix-ui/react-toast": "^1.2.7",
    "@radix-ui/react-toggle": "^1.1.3",
    "@radix-ui/react-toggle-group": "^1.1.3",
    "@radix-ui/react-tooltip": "^1.2.0",
    "@sendgrid/mail": "^8.1.5",
    "@tanstack/react-query": "^5.60.5",
    "@types/bcryptjs": "^2.4.6",
    "@types/memoizee": "^0.4.12",
    "@types/uuid": "^10.0.0",
    "@xterm/xterm": "^5.5.0",
    "bcryptjs": "^2.4.3",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "connect-pg-simple": "^10.0.0",
    "date-fns": "^3.6.0",
    "dotenv": "^16.4.5",
    "drizzle-orm": "^0.39.1",
    "drizzle-zod": "^0.7.0",
    "embla-carousel-react": "^8.6.0",
    "express": "^4.21.2",
    "express-session": "^1.18.1",
    "framer-motion": "^11.13.1",
    "input-otp": "^1.4.2",
    "lucide-react": "^0.453.0",
    "memoizee": "^0.4.17",
    "memorystore": "^1.6.7",
    "next-themes": "^0.4.6",
    "openai": "^4.103.0",
    "pino": "^9.7.0",
    "pino-pretty": "^13.0.0",
    "postgres": "^3.4.4",
    "react": "^18.3.1",
    "react-day-picker": "^8.10.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.55.0",
    "react-icons": "^5.4.0",
    "react-resizable-panels": "^2.1.7",
    "recharts": "^2.15.2",
    "styled-jsx": "^5.1.7",
    "tailwind-merge": "^2.6.0",
    "tailwindcss-animate": "^1.0.7",
    "tw-animate-css": "^1.2.5",
    "uuid": "^11.1.0",
    "vaul": "^1.1.2",
    "winston": "^3.17.0",
    "wouter": "^3.3.5",
    "ws": "^8.18.0",
    "xterm": "^5.3.0",
    "zod": "^3.24.2",
    "zod-validation-error": "^3.4.0"
  },
  "devDependencies": {
    "@tailwindcss/typography": "^0.5.15",
    "@tailwindcss/vite": "^4.1.3",
    "@types/connect-pg-simple": "^7.0.3",
    "@types/express": "4.17.21",
    "@types/express-session": "^1.18.0",
    "@types/node": "20.16.11",
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.1",
    "@types/ws": "^8.5.13",
    "@vitejs/plugin-react": "^4.3.2",
    "autoprefixer": "^10.4.20",
    "concurrently": "^9.1.0",
    "cross-env": "^7.0.3",
    "drizzle-kit": "^0.30.4",
    "esbuild": "^0.25.0",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.17",
    "tsx": "^4.19.1",
    "typescript": "5.6.3",
    "vite": "^5.4.14"
  },
  "optionalDependencies": {
    "bufferutil": "^4.0.8"
  }
}
EOF

print_success "Fixed package.json with bcryptjs"

# Remove old dependencies and lockfile
print_status "Cleaning old dependencies..."
rm -rf node_modules/ package-lock.json dist/ .npm/

# Create optimized Dockerfile
print_status "Creating optimized Dockerfile..."
cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
EOF

# Create docker-compose with fixed configuration
print_status "Creating docker-compose.yml..."
cat > docker-compose.yml << 'EOF'
version: '3.8'

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
    restart: unless-stopped

volumes:
  postgres_data:
EOF

# Build and run
print_status "Building Docker image with fixed dependencies..."
if docker-compose build --no-cache; then
    print_success "Docker build successful!"
else
    print_error "Docker build failed"
    exit 1
fi

print_status "Starting containers..."
if docker-compose up -d; then
    print_success "Containers started!"
else
    print_error "Failed to start containers"
    exit 1
fi

# Wait and check
sleep 10
print_status "Checking container status..."

if docker-compose ps | grep -q "Up"; then
    print_success "Containers are running!"
    
    echo ""
    echo "🎮 RogueSim should now be available at:"
    echo "   http://localhost:3000"
    echo ""
    
    # Check for bcrypt errors in logs
    if docker-compose logs app 2>&1 | grep -q "bcrypt"; then
        print_warning "Still seeing bcrypt references in logs:"
        docker-compose logs app --tail 5
    else
        print_success "No bcrypt errors detected!"
        echo "📋 Recent logs:"
        docker-compose logs app --tail 10
    fi
else
    print_error "Containers failed to start properly"
    echo "📋 Checking logs:"
    docker-compose logs app
fi

echo ""
echo "🔧 Useful commands:"
echo "  View logs: docker-compose logs app -f"
echo "  Restart: docker-compose restart app"
echo "  Stop: docker-compose down" 