#!/bin/bash

echo "🔧 RogueSim Port Mapping Fix & Deploy Script"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: docker-compose.yml not found. Run this from the RogueSim root directory."
    exit 1
fi

echo "📝 Committing port mapping fixes..."

# Add the modified files
git add docker-compose.yml Dockerfile

# Commit the changes
git commit -m "Fix Docker port mapping: 3000:5000 (app runs on port 5000 internally)"

echo "📤 Pushing changes to repository..."
git push origin main

echo "🚀 Deploying to server..."

# SSH to server and update
ssh root@95.217.135.97 << 'EOF'
    echo "📥 Pulling latest changes..."
    cd /opt/roguesim/RogueSim
    
    echo "🛑 Stopping containers..."
    docker-compose down
    
    echo "📥 Pulling latest code..."
    git pull origin main
    
    echo "🔨 Rebuilding app container with new port mapping..."
    docker-compose build --no-cache app
    
    echo "🚀 Starting all containers..."
    docker-compose up -d
    
    echo "⏳ Waiting for containers to start..."
    sleep 10
    
    echo "📊 Container status:"
    docker-compose ps
    
    echo "🧪 Testing connection..."
    curl -s http://localhost:3000 > /dev/null
    if [ $? -eq 0 ]; then
        echo "✅ SUCCESS: Application is responding on port 3000!"
        echo "🌐 Your app should now be accessible at http://95.217.135.97:3000"
    else
        echo "❌ Connection test failed. Checking logs..."
        docker logs roguesim-app-1 --tail 20
    fi
EOF

echo ""
echo "🎉 Deployment complete!"
echo "🌐 Your RogueSim should now be accessible at: http://95.217.135.97:3000"
echo ""
echo "If there are still issues, check the server logs with:"
echo "ssh root@95.217.135.97 'cd /opt/roguesim/RogueSim && docker logs roguesim-app-1'"
