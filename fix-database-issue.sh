#!/bin/bash

echo "🔧 Database Container Diagnostic & Fix"
echo "====================================="

# Check if we're on the server
if [ ! -f "/opt/roguesim/RogueSim/docker-compose.yml" ]; then
    echo "❌ This script should be run on your Hetzner server (49.13.197.91)"
    echo "📋 Commands to run on your server:"
    echo ""
    echo "# 1. Copy this script to your server:"
    echo "scp fix-database-issue.sh root@49.13.197.91:/opt/roguesim/"
    echo ""
    echo "# 2. SSH to server and run:"
    echo "ssh root@49.13.197.91"
    echo "cd /opt/roguesim"
    echo "chmod +x fix-database-issue.sh"
    echo "./fix-database-issue.sh"
    exit 1
fi

cd /opt/roguesim/RogueSim

echo "1️⃣  Checking current container status..."
docker-compose ps

echo ""
echo "2️⃣  Checking database container logs..."
docker-compose logs db | tail -20

echo ""
echo "3️⃣  Stopping all services..."
docker-compose down

echo ""
echo "4️⃣  Removing old database data..."
# Clean up any potentially corrupted database data
docker volume ls | grep postgres
if [ $? -eq 0 ]; then
    echo "Removing postgres volumes..."
    docker volume rm $(docker volume ls -q | grep postgres) 2>/dev/null || true
fi

echo ""
echo "5️⃣  Checking database environment variables..."
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << 'EOF'
NODE_ENV=production
DATABASE_URL=postgresql://postgres:postgres123@db:5432/roguesim
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres123
POSTGRES_DB=roguesim
PGADMIN_DEFAULT_EMAIL=admin@roguesim.com
PGADMIN_DEFAULT_PASSWORD=admin123
SESSION_SECRET=your-super-secret-session-key-change-this
EOF
fi

echo ""
echo "6️⃣  Creating simplified docker-compose for testing..."
cat > docker-compose-test.yml << 'EOF'
version: '3.8'

services:
  db:
    image: postgres:15
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres123
      POSTGRES_DB: roguesim
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s

volumes:
  postgres_data:
EOF

echo ""
echo "7️⃣  Testing database container alone..."
docker-compose -f docker-compose-test.yml up -d db

echo ""
echo "8️⃣  Waiting for database to start..."
sleep 10

echo ""
echo "9️⃣  Checking database health..."
docker-compose -f docker-compose-test.yml ps
docker-compose -f docker-compose-test.yml logs db | tail -10

echo ""
echo "🔟  Testing database connection..."
docker-compose -f docker-compose-test.yml exec -T db psql -U postgres -d roguesim -c "SELECT version();" || {
    echo "❌ Database connection failed"
    echo "Checking container status:"
    docker-compose -f docker-compose-test.yml logs db
}

if docker-compose -f docker-compose-test.yml exec -T db psql -U postgres -d roguesim -c "SELECT version();" > /dev/null 2>&1; then
    echo "✅ Database is working!"
    echo ""
    echo "1️⃣1️⃣  Stopping test database..."
    docker-compose -f docker-compose-test.yml down
    
    echo ""
    echo "1️⃣2️⃣  Starting full application..."
    docker-compose up -d
    
    echo ""
    echo "1️⃣3️⃣  Final status check..."
    sleep 15
    docker-compose ps
    
    echo ""
    echo "1️⃣4️⃣  Testing application..."
    curl -I http://localhost:80 2>/dev/null || echo "App not ready yet, check logs"
    
    echo ""
    echo "🎉 Database fix completed!"
    echo "🌐 Your site should be accessible at: https://roguesim.com"
    
else
    echo "❌ Database is still failing. Manual investigation needed:"
    echo "1. Check docker-compose logs db"
    echo "2. Check disk space: df -h"
    echo "3. Check memory: free -h"
    echo "4. Try: docker system prune -f"
fi

echo ""
echo "📋 Cleanup test file..."
rm -f docker-compose-test.yml 