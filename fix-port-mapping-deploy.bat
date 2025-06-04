@echo off
echo 🔧 RogueSim Port Mapping Fix ^& Deploy Script
echo ==============================================

REM Check if we're in the right directory
if not exist "docker-compose.yml" (
    echo ❌ Error: docker-compose.yml not found. Run this from the RogueSim root directory.
    pause
    exit /b 1
)

echo 📝 Committing port mapping fixes...

REM Add the modified files
git add docker-compose.yml Dockerfile

REM Commit the changes
git commit -m "Fix Docker port mapping: 3000:5000 (app runs on port 5000 internally)"

echo 📤 Pushing changes to repository...
git push origin main

echo 🚀 Deploying to server...

REM SSH to server and update
ssh root@95.217.135.97 "cd /opt/roguesim/RogueSim && echo '📥 Pulling latest changes...' && docker-compose down && echo '📥 Pulling latest code...' && git pull origin main && echo '🔨 Rebuilding app container with new port mapping...' && docker-compose build --no-cache app && echo '🚀 Starting all containers...' && docker-compose up -d && echo '⏳ Waiting for containers to start...' && timeout 10 && echo '📊 Container status:' && docker-compose ps && echo '🧪 Testing connection...' && curl -s http://localhost:3000 && echo '✅ SUCCESS: Application should be responding on port 3000!' || echo '❌ Connection test failed. Check logs with: docker logs roguesim-app-1'"

echo.
echo 🎉 Deployment complete!
echo 🌐 Your RogueSim should now be accessible at: http://95.217.135.97:3000
echo.
echo If there are still issues, check the server logs with:
echo ssh root@95.217.135.97 "cd /opt/roguesim/RogueSim && docker logs roguesim-app-1"
pause 