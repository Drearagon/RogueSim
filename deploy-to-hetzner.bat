@echo off
echo 🚀 RogueSim Hetzner Deployment Script
echo.

set /p SERVER_IP="Enter your Hetzner server IP address: "

if "%SERVER_IP%"=="" (
    echo ❌ Server IP is required
    pause
    exit /b 1
)

echo ✅ Using server IP: %SERVER_IP%
echo.

echo 🔑 Testing SSH connection...
ssh -o ConnectTimeout=10 root@%SERVER_IP% "echo SSH connection successful" >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Cannot connect to server. Please check:
    echo    - Server IP is correct
    echo    - SSH key is set up
    echo    - Server is running
    pause
    exit /b 1
)

echo ✅ SSH connection working
echo.
echo 📦 Starting deployment...

REM Create temporary script file
echo # RogueSim Production Deployment > deploy_temp.sh
echo echo "🔄 Updating system packages..." >> deploy_temp.sh
echo apt update ^&^& apt upgrade -y >> deploy_temp.sh
echo. >> deploy_temp.sh
echo echo "🐳 Installing Docker..." >> deploy_temp.sh
echo curl -fsSL https://get.docker.com -o get-docker.sh >> deploy_temp.sh
echo sh get-docker.sh >> deploy_temp.sh
echo apt install docker-compose-plugin -y >> deploy_temp.sh
echo. >> deploy_temp.sh
echo echo "🌐 Installing Nginx..." >> deploy_temp.sh
echo apt install nginx certbot python3-certbot-nginx -y >> deploy_temp.sh
echo. >> deploy_temp.sh
echo echo "📥 Cloning RogueSim repository..." >> deploy_temp.sh
echo cd /opt >> deploy_temp.sh
echo rm -rf RogueSim >> deploy_temp.sh
echo git clone https://github.com/Drearagon/RogueSim.git >> deploy_temp.sh
echo cd RogueSim >> deploy_temp.sh
echo. >> deploy_temp.sh

REM Copy the script to server and execute
scp deploy_temp.sh root@%SERVER_IP%:/tmp/
ssh root@%SERVER_IP% "chmod +x /tmp/deploy_temp.sh && /tmp/deploy_temp.sh"

REM Clean up
del deploy_temp.sh

echo.
echo 🎉 Deployment completed successfully!
echo.
echo 📋 Next Steps:
echo 1. Wait 5-10 minutes for DNS propagation
echo 2. Test your domain: http://roguesim.com
echo 3. Run SSL setup manually on your server
echo.
echo 🚀 Your RogueSim will be live at: https://roguesim.com
echo.
pause 