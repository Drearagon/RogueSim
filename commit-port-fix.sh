#!/bin/bash

echo "📝 Committing port mapping fixes..."

git add docker-compose.yml Dockerfile
git commit -m "Fix Docker port mapping: 3000:5000 (app runs on port 5000 internally)"

echo "📤 Pushing to repository..."
git push origin main

echo "✅ Changes committed and pushed!"
echo ""
echo "Now copy and run this on your server:"
echo ""
echo "wget -O fix.sh https://raw.githubusercontent.com/yourusername/RogueSim/main/server-fix-port-mapping.sh"
echo "chmod +x fix.sh"
echo "./fix.sh" 