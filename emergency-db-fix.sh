#!/bin/bash

echo "🚨 Emergency Database Fix"
echo "========================"

# Check if we're on the server
if [ ! -f "/opt/roguesim/RogueSim/docker-compose.yml" ]; then
    echo "❌ Run this on your Hetzner server"
    echo "scp emergency-db-fix.sh root@49.13.197.91:/opt/roguesim/"
    echo "ssh root@49.13.197.91"
    echo "cd /opt/roguesim && chmod +x emergency-db-fix.sh && ./emergency-db-fix.sh"
    exit 1
fi

cd /opt/roguesim/RogueSim

echo "1️⃣  System resources check..."
echo "Disk space:"
df -h
echo ""
echo "Memory:"
free -h
echo ""

echo "2️⃣  Stopping everything..."
docker-compose down
docker stop $(docker ps -aq) 2>/dev/null || true

echo ""
echo "3️⃣  System cleanup..."
# Clean up Docker
docker system prune -f
docker volume prune -f

echo ""
echo "4️⃣  Removing problematic containers..."
docker rm -f roguesim-db-1 roguesim-app-1 roguesim-nginx-1 2>/dev/null || true

echo ""
echo "5️⃣  Creating minimal working environment..."
cat > .env << 'EOF'
NODE_ENV=production
DATABASE_URL=postgresql://postgres:postgres123@db:5432/roguesim
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres123
POSTGRES_DB=roguesim
SESSION_SECRET=emergency-session-key
EOF

echo ""
echo "6️⃣  Starting with minimal config..."
# Start only the essential services
docker-compose up -d db

echo ""
echo "7️⃣  Waiting for database..."
sleep 20

echo ""
echo "8️⃣  Checking database status..."
docker-compose logs db | tail -10

if docker-compose exec -T db pg_isready -U postgres; then
    echo "✅ Database is running!"
    
    echo ""
    echo "9️⃣  Starting application..."
    docker-compose up -d app
    sleep 10
    
    echo ""
    echo "🔟  Starting nginx..."
    docker-compose up -d nginx
    sleep 5
    
    echo ""
    echo "✅ All services started!"
    docker-compose ps
    
    echo ""
    echo "🌐 Testing site..."
    curl -I http://localhost:80 || echo "Still starting up..."
    
else
    echo "❌ Database failed to start"
    echo "Checking logs:"
    docker-compose logs db
    
    echo ""
    echo "💡 Manual steps to try:"
    echo "1. Check if PostgreSQL port is free: sudo netstat -tulpn | grep :5432"
    echo "2. Restart Docker service: sudo systemctl restart docker"
    echo "3. Reboot server: sudo reboot"
fi 