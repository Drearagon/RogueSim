#!/bin/bash

# Comprehensive Deployment & Diagnostic Script for RogueSim Server on Hetzner

# --- Configuration ---
PROJECT_DIR="/opt/roguesim/RogueSim" # Your project root directory
NGINX_CONF_AVAILABLE="/etc/nginx/sites-available/roguesim.conf"
NGINX_CONF_ENABLED_CORRECT="/etc/nginx/sites-enabled/roguesim.conf"
NGINX_CONF_ENABLED_OLD="/etc/nginx/sites-enabled/roguesim.com" # The conflicting one
DIAGNOSTIC_SCRIPT="${PROJECT_DIR}/roguesim-diagnostic.sh"

# --- Colors for Output ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# --- Helper Functions ---
function section_header {
    echo -e "\n${BLUE}### $1 ###${NC}\n"
}

function exit_on_error {
    if [ $? -ne 0 ]; then
        echo -e "${RED}ERROR: $1. Exiting script.${NC}"
        exit 1
    fi
}

# --- Script Start ---
echo -e "${GREEN}Starting automated deployment and diagnostic process...${NC}"
echo -e "${YELLOW}Timestamp: $(date)${NC}"

# Ensure we are root
if [ "$(id -u)" -ne 0 ]; then
   echo -e "${RED}ERROR: This script must be run as root. Please use 'sudo bash $0'${NC}"
   exit 1
fi

# --- Step 0: Important Pre-Run Checklist ---
section_header "Pre-Run Checklist (Manual Steps You MUST Do Locally)"
echo -e "${YELLOW}====================================================${NC}"
echo -e "${YELLOW}BEFORE running this script, ensure you have done the following LOCALLY:${NC}"
echo -e "1. ${GREEN}Modified server/index.ts:${NC}"
echo -e "   - Move 'serveStatic(app);' (in production block) and the error handler (app.use((err...)) to the correct order."
echo -e "   - The error handler should be the LAST app.use() after 'serveStatic(app)'."
echo -e "   - Consider removing 'throw err;' from the final error handler for production stability."
echo -e "2. ${GREEN}Modified server/vite.ts:${NC}"
echo -e "   - Ensure 'serveStatic' function correctly sets up 'express.static' and the 'app.get(\"*\")' SPA fallback."
echo -e "   - Confirm 'clientBuildPath' points to '/app/dist/public'."
echo -e "3. ${GREEN}Removed Nginx Content-Security-Policy header:${NC}"
echo -e "   - Comment out or remove 'add_header Content-Security-Policy ...' from ${NGINX_CONF_AVAILABLE} temporarily."
echo -e "4. ${GREEN}Built your project locally:${NC} npm run build"
echo -e "5. ${GREEN}Committed ALL changes (including package-lock.json) and pushed to Git:${NC} git add . && git commit -m 'Final fixes' && git push origin main"
echo -e "${YELLOW}====================================================${NC}"
read -p "Have you completed these LOCAL steps and pushed to Git? (y/N): " response
if [[ ! "$response" =~ ^[yY]$ ]]; then
    echo -e "${RED}Aborting: Please complete the local development and push steps first.${NC}"
    exit 1
fi

# --- Step 1: Navigate to Project Directory ---
section_header "Navigating to Project Directory"
cd "$PROJECT_DIR"
exit_on_error "Failed to navigate to $PROJECT_DIR"
echo -e "Successfully changed to $PROJECT_DIR"

# --- Step 2: Pull Latest Code from Git ---
section_header "Pulling Latest Code from Git"
git pull origin main
exit_on_error "Git pull failed. Resolve conflicts/issues manually."
echo -e "Successfully pulled latest code."

# --- Step 3: Perform Clean Docker Build and Restart Services ---
section_header "Performing Clean Docker Build and Restarting Services"
echo -e "Stopping and removing existing containers, networks, and volumes..."
sudo docker-compose down --volumes --rmi all
exit_on_error "Docker Compose down failed"

echo -e "Building new Docker images and starting services..."
sudo docker-compose build --no-cache
exit_on_error "Docker Compose up failed"
echo -e "Docker services are starting. Please wait a moment..."
sleep 15 # Give containers time to fully start

# --- Step 4: Fix Nginx Configuration Conflict ---
section_header "Fixing Nginx Configuration Conflicts"
if [ -f "$NGINX_CONF_ENABLED_OLD" ]; then
    echo -e "Found old conflicting Nginx config: $NGINX_CONF_ENABLED_OLD. Removing it."
    sudo rm "$NGINX_CONF_ENABLED_OLD"
    exit_on_error "Failed to remove old Nginx config $NGINX_CONF_ENABLED_OLD"
else
    echo -e "No old conflicting Nginx config found at $NGINX_CONF_ENABLED_OLD."
fi

# Ensure the correct symlink exists and is fresh
if [ -L "$NGINX_CONF_ENABLED_CORRECT" ]; then # Check if symlink exists
    echo -e "Removing existing symlink to ensure fresh link: $NGINX_CONF_ENABLED_CORRECT"
    sudo rm "$NGINX_CONF_ENABLED_CORRECT"
fi
if [ ! -L "$NGINX_CONF_ENABLED_CORRECT" ]; then # Create if not existing or just removed
    echo -e "Creating/Recreating symlink for correct Nginx config: $NGINX_CONF_ENABLED_CORRECT -> $NGINX_CONF_AVAILABLE"
    sudo ln -s "$NGINX_CONF_AVAILABLE" "$NGINX_CONF_ENABLED_CORRECT"
    exit_on_error "Failed to create symlink for Nginx config"
fi

echo -e "Testing Nginx configuration syntax..."
sudo nginx -t
exit_on_error "Nginx configuration test failed. Check $NGINX_CONF_AVAILABLE for syntax errors."
echo -e "Nginx configuration syntax is OK."

echo -e "Reloading Nginx service..."
sudo systemctl reload nginx
exit_on_error "Failed to reload Nginx service. Check 'sudo systemctl status nginx.service' and 'journalctl -xeu nginx.service' for details."
echo -e "Nginx reloaded successfully."

# --- Step 5: Run Comprehensive Diagnostic Check ---
section_header "Running Comprehensive Diagnostic Check"
if [ -f "$DIAGNOSTIC_SCRIPT" ]; then
    sudo bash "$DIAGNOSTIC_SCRIPT"
else
    echo -e "${RED}ERROR: Diagnostic script not found at ${DIAGNOSTIC_SCRIPT}. Cannot run final check.${NC}"
fi

# --- Final Instructions ---
section_header "Deployment and Diagnostic Complete - FINAL STEPS"
echo -e "${GREEN}================================================================${NC}"
echo -e "${GREEN}Review the diagnostic output above carefully!${NC}"
echo -e "\n${YELLOW}What to look for:${NC}"
echo -e " - All Docker containers are 'Up'."
echo -e " - Your 'roguesim-app-1' logs show '🚀 RogueSim server running on http://0.0.0.0:5000'."
echo -e " - 'Internal Connectivity to RogueSim Backend (localhost:3000)' check will still show 000, as your app is on 5000. This is expected."
echo -e " - BUT, the 'Nginx Error Log' should be clean (no 'connect() failed' errors)."
echo -e " - The 'HTTP/HTTPS Connectivity to roguesim.com' should show a '200 OK' (possibly after redirects)."
echo -e "\n${YELLOW}Remaining Manual Steps (after successful deployment):${NC}"
echo -e "1. ${GREEN}Test your website in a web browser:${NC} Open https://roguesim.com"
echo -e "   - If it works, congratulations! You've fixed it."
echo -e "   - If you still get a 405, double-check server/index.ts and server/vite.ts locally."
echo -e "2. ${YELLOW}Fix SendGrid API Key Warning:${NC} If logs show 'API key does not start with \"SG.\"', update your SENDGRID_API_KEY in your .env or docker-compose.yml."
echo -e "3. ${YELLOW}Address Disk Usage (89%):${NC} This is high. Consider cleaning up old Docker images/volumes or expanding your disk if issues persist."
echo -e "4. ${YELLOW}SSH Connectivity:${NC} If you still can't SSH directly, troubleshoot sshd as per previous instructions."
echo -e "${GREEN}================================================================${NC}"
echo -e "${GREEN}Script finished. Good luck!${NC}"
