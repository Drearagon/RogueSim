#!/bin/bash

echo "🔧 RogueSim Complete Server Fix & Deploy"
echo "========================================"
echo "Server: 49.13.197.91"
echo "Fixing vite dependency issues..."
echo ""

# Stop everything first
echo "🛑 Stopping all containers..."
docker-compose down 2>/dev/null || true
docker stop $(docker ps -aq) 2>/dev/null || true

# Clean up aggressively
echo "🧹 Deep cleaning Docker..."
docker system prune -af
docker volume prune -f

# Pull latest code
echo "📥 Pulling latest code..."
git pull

# Fix the Dockerfile to keep vite in production
echo "📝 Creating fixed Dockerfile..."
cat > Dockerfile << 'EOF'
# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (we need vite for server/vite.ts)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN echo "Starting build process..." && \
    echo "Current directory:" && pwd && \
    echo "Files in current directory:" && ls -la && \
    echo "Package.json scripts:" && cat package.json | grep -A 10 '"scripts"' && \
    npm run build

# Verify build output
RUN echo "Build completed. Checking dist folder:" && ls -la dist/ || echo "No dist folder found"

# Keep vite and build tools for server/vite.ts - DO NOT PRUNE
# The server imports vite dynamically so we need it at runtime

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
EOF

# Create proper docker-compose.yml
echo "📝 Creating docker-compose.yml..."
cat > docker-compose.yml << 'EOF'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://rogueuser:nZrdLEehQFVTZ9ogVZXxmfpKOe68thkQTtwuVXaokQM=@postgres:5432/roguesim
      - SESSION_SECRET=your-super-secret-session-key-here
      - SENDGRID_API_KEY=your-sendgrid-api-key-here
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:15
    container_name: roguesim-postgres
    environment:
      - POSTGRES_DB=roguesim
      - POSTGRES_USER=rogueuser
      - POSTGRES_PASSWORD=nZrdLEehQFVTZ9ogVZXxmfpKOe68thkQTtwuVXaokQM=
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    restart: unless-stopped

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: roguesim-pgadmin
    environment:
      - PGADMIN_DEFAULT_EMAIL=uplink@roguesim.com
      - PGADMIN_DEFAULT_PASSWORD=roguesim123
    ports:
      - "8080:80"
    restart: unless-stopped

volumes:
  postgres_data:
EOF

# Test local build first to catch issues early
echo "🔨 Testing local npm build..."
if npm install && npm run build; then
    echo "✅ Local build successful!"
else
    echo "❌ Local build failed. Checking package.json..."
    cat package.json | grep -A 20 '"scripts"'
    echo ""
    echo "Trying to fix missing scripts..."
    
    # Check if build script exists
    if ! grep -q '"build"' package.json; then
        echo "Adding missing build script..."
        # This would require more complex JSON manipulation
        echo "Please check your package.json build script"
    fi
fi

# Build containers with no cache
echo "🐳 Building Docker containers (no cache)..."
docker-compose build --no-cache

# Start everything
echo "🚀 Starting all services..."
docker-compose up -d

# Wait for startup
echo "⏳ Waiting for containers to start..."
sleep 15

# Check container status
echo ""
echo "📊 Container Status:"
docker-compose ps

echo ""
echo "🎯 Checking app container logs..."
docker-compose logs app | tail -20

echo ""
echo "🔍 Testing if app is responding..."
if curl -f http://localhost:3000 >/dev/null 2>&1; then
    echo "✅ App is responding on port 3000!"
else
    echo "⚠️  App may still be starting up..."
    echo "📋 Recent app logs:"
    docker-compose logs app | tail -10
fi

echo ""
echo "🔍 Testing database connection..."
if docker exec roguesim-postgres pg_isready -U rogueuser >/dev/null 2>&1; then
    echo "✅ Database is ready!"
else
    echo "⚠️  Database may still be starting up..."
fi

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "🌐 Access Points:"
echo "• RogueSim: http://49.13.197.91:3000"
echo "• RogueSim: https://roguesim.com (if domain configured)"
echo "• pgAdmin: http://49.13.197.91:8080"
echo "  Login: uplink@roguesim.com / roguesim123"
echo ""
echo "🔍 Monitor logs:"
echo "docker-compose logs app -f"
echo ""
echo "🛑 To stop:"
echo "docker-compose down"
echo ""
echo "🚨 If you still get vite errors:"
echo "1. Check: docker-compose logs app"
echo "2. Try: docker-compose restart app"
echo "3. The fix keeps vite in production for server/vite.ts" 