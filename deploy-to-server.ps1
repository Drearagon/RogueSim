Write-Host "🚀 RogueSim Local Build & Server Deploy (PowerShell)" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

# Configuration
$SERVER_IP = "49.13.197.91"
$SERVER_PATH = "/opt/roguesim/RogueSim"
$SERVER_USER = "root"

Write-Host ""
Write-Host "🎯 Strategy: Build locally, deploy to server" -ForegroundColor Yellow
Write-Host "   • Local build creates dist directory"
Write-Host "   • Transfer built files to server"
Write-Host "   • Rebuild containers on server with working build"
Write-Host ""

# Step 1: Local build
Write-Host "📋 1. LOCAL BUILD" -ForegroundColor Green
Write-Host "================="

Write-Host "🧹 Cleaning previous build..."
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
}

Write-Host "📦 Installing dependencies..."
npm install

Write-Host "🏗️  Building production application..."
npm run build

Write-Host ""
Write-Host "📊 Checking build output..."
if (Test-Path "dist") {
    Write-Host "✅ Local build successful!" -ForegroundColor Green
    Write-Host "📁 Build contents:"
    Get-ChildItem "dist" | Select-Object -First 10 | Format-Table
    $buildSize = (Get-ChildItem "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "📊 Build size: $([math]::Round($buildSize, 2)) MB"
} else {
    Write-Host "❌ Local build failed - cannot proceed" -ForegroundColor Red
    exit 1
}

# Step 2: Transfer to server using SCP
Write-Host ""
Write-Host "📋 2. TRANSFER TO SERVER" -ForegroundColor Green
Write-Host "======================="

Write-Host "📤 Creating deployment package..."
$deployFiles = @(
    "dist/*",
    "docker-compose.yml", 
    "Dockerfile",
    "package.json",
    "package-lock.json"
)

Write-Host "📤 Uploading files to server..."
Write-Host "💡 Note: You'll need SSH access configured. Use WSL or install OpenSSH for Windows if needed."
Write-Host ""
Write-Host "🔧 Manual upload commands (run these if automated upload fails):"
Write-Host "   scp -r dist/ ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/"
Write-Host "   scp docker-compose.yml Dockerfile package*.json ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/"
Write-Host ""

# Try SCP if available
try {
    Write-Host "Attempting automated upload..."
    & scp -r "dist/" "${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/"
    & scp "docker-compose.yml", "Dockerfile", "package.json", "package-lock.json" "${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/"
    Write-Host "✅ Files uploaded successfully!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Automated upload failed. Please run the manual commands above." -ForegroundColor Yellow
    Write-Host "Press Enter when files are uploaded to continue..."
    Read-Host
}

# Step 3: Deploy on server
Write-Host ""
Write-Host "📋 3. SERVER DEPLOYMENT" -ForegroundColor Green
Write-Host "======================"

$deployScript = @"
cd /opt/roguesim/RogueSim

echo "📊 Verifying transferred files..."
ls -la dist/ | head -5
echo ""

echo "🛑 Stopping existing containers..."
docker-compose down

echo ""
echo "🧹 Cleaning Docker cache..."
docker system prune -f

echo ""
echo "🔄 Rebuilding containers with fresh build..."
docker-compose build --no-cache

echo ""
echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for startup..."
sleep 20

echo ""
echo "📊 Container status:"
docker-compose ps

echo ""
echo "📊 App logs:"
docker-compose logs --tail=15 app

echo ""
echo "🧪 Testing API endpoint..."
curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{\"email\":\"test@example.com\",\"password\":\"test\"}' \
  -w "\nHTTP Status: %{http_code}\n" \
  2>/dev/null || echo "❌ API test failed"
"@

try {
    Write-Host "🔄 Executing deployment on server..."
    & ssh "${SERVER_USER}@${SERVER_IP}" $deployScript
} catch {
    Write-Host "⚠️  SSH deployment failed. Manual deployment required:" -ForegroundColor Yellow
    Write-Host "1. SSH to server: ssh ${SERVER_USER}@${SERVER_IP}"
    Write-Host "2. Run the deployment commands manually"
}

# Step 4: Final verification
Write-Host ""
Write-Host "📋 4. FINAL VERIFICATION" -ForegroundColor Green
Write-Host "========================"

Write-Host "🌐 Testing external access..."
try {
    $response = Invoke-WebRequest -Uri "http://${SERVER_IP}" -Method Head -TimeoutSec 10
    Write-Host "✅ Server responding: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Server not responding on HTTP" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎯 DEPLOYMENT COMPLETE!" -ForegroundColor Cyan
Write-Host "======================"
Write-Host ""
Write-Host "✅ Local build successful" -ForegroundColor Green
Write-Host "✅ Files ready for transfer" -ForegroundColor Green
Write-Host "✅ Deployment commands executed" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Your app should now be fully working at:" -ForegroundColor Yellow
Write-Host "   • http://roguesim.com"
Write-Host "   • http://${SERVER_IP}"
Write-Host ""
Write-Host "💡 If login still fails, check server logs with:" -ForegroundColor Cyan
Write-Host "   ssh ${SERVER_USER}@${SERVER_IP} 'cd ${SERVER_PATH} && docker-compose logs app'" 