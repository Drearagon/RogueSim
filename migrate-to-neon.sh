#!/bin/bash

# Script to Automate Server-Side Migration to Neon Database

# --- Configuration ---
PROJECT_DIR="/opt/roguesim/RogueSim"
ENV_FILE="${PROJECT_DIR}/.env"
DIAGNOSTIC_SCRIPT="${PROJECT_DIR}/super_diagnose.sh" # Your super_diagnose script

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
echo -e "${GREEN}Starting automated Neon migration deployment...${NC}"
echo -e "${YELLOW}Timestamp: $(date)${NC}"

# Ensure we are root
if [ "$(id -u)" -ne 0 ]; then
   echo -e "${RED}ERROR: This script must be run as root. Please use 'sudo bash $0'${NC}"
   exit 1
fi

# --- Step 0: Pre-Run Checklist Reminder (MUST be done LOCALLY and pushed) ---
section_header "IMPORTANT: LOCAL CHECKLIST (MUST BE COMPLETED & PUSHED TO GIT)"
echo -e "${YELLOW}================================================================${NC}"
echo -e "This script assumes you have ALREADY done the following LOCALLY and pushed changes to Git:"
echo -e "1. ${GREEN}Created your Neon project and copied the DATABASE_URL.${NC}"
echo -e "2. ${GREEN}Updated your LOCAL .env:${NC} set DATABASE_URL, DB_PASSWORD, SESSION_SECRET, SENDGRID_API_KEY."
echo -e "3. ${GREEN}Refactored server/db.ts:${NC} Uses `let initializedDb/Pool`, `getDb()/getPool()`, `initDatabase()` handles `ws` for Neon."
echo -e "4. ${GREEN}Refactored server/storage.ts:${NC} Exports `DatabaseStorage` CLASS, constructor takes `drizzleDb, rawPool`."
echo -e "5. ${GREEN}Refactored server/routes.ts:${NC} Imports `getDb, getPool, DatabaseStorage`, instantiates `storage = new DatabaseStorage(...)` inside `registerRoutes`."
echo -e "6. ${GREEN}Refactored server/index.ts:${NC} Calls `await initDatabase()` before `registerRoutes()`."
echo -e "7. ${GREEN}Updated docker-compose.yml:${NC} Removed `postgres` and `pgadmin` services, removed `postgres_data` volume, ensured `app` service `ports` is `8000:5000`."
echo -e "8. ${GREEN}Ran 'npm run db:push' LOCALLY (to apply schema to Neon).${NC}"
echo -e "9. ${GREEN}Committed and Pushed ALL these local code and config changes to Git.${NC}"
echo -e "${YELLOW}================================================================${NC}"
read -p "Have you completed ALL these local steps and pushed them to Git? (y/N): " response
if [[ ! "$response" =~ ^[yY]$ ]]; then
    echo -e "${RED}Aborting: Please complete the local development and Git push steps first.${NC}"
    exit 1
fi

# --- Step 1: Prompt for Neon Connection Details and Update Server's .env ---
section_header "Updating Server's .env with Neon Details"
echo -e "${YELLOW}Please enter your Neon DATABASE_URL. This will update ${ENV_FILE}${NC}"
read -p "Neon DATABASE_URL: " NEON_DB_URL
echo -e "${YELLOW}Please enter the password for your DB_USER (from Neon DATABASE_URL).${NC}"
read -s -p "DB_PASSWORD: " NEON_DB_PASSWORD
echo # Newline after password input

# Update .env file on the server
# Use sed to replace the lines. Ensure it's safe.
if [ -f "$ENV_FILE" ]; then
    echo -e "Backing up existing ${ENV_FILE}..."
    sudo cp "$ENV_FILE" "${ENV_FILE}.bak_$(date +%Y%m%d_%H%M%S)"
fi

echo -e "Updating ${ENV_FILE} with Neon DATABASE_URL and DB_PASSWORD..."
# Use awk to find and replace lines or add if they don't exist
sudo awk -v db_url="$NEON_DB_URL" -v db_pass="$NEON_DB_PASSWORD" '
BEGIN {
    FS=OFS="=";
    found_db_url=0;
    found_db_pass=0;
}
/^[[:space:]]*DATABASE_URL=/ { $2=db_url; found_db_url=1; print; next }
/^[[:space:]]*DB_PASSWORD=/ { $2=db_pass; found_db_pass=1; print; next }
{ print }
END {
    if (!found_db_url) print "DATABASE_URL=" db_url;
    if (!found_db_pass) print "DB_PASSWORD=" db_pass;
}' "$ENV_FILE" > "${ENV_FILE}.tmp" && sudo mv "${ENV_FILE}.tmp" "$ENV_FILE"
exit_on_error "Failed to update ${ENV_FILE}"
echo -e "${GREEN}${ENV_FILE} updated successfully with Neon details.${NC}"


# --- Step 2: Navigate to Project Directory & Pull Latest Code ---
section_header "Navigating to Project Directory & Pulling Latest Code"
cd "$PROJECT_DIR" || exit_on_error "Failed to navigate to $PROJECT_DIR"
git pull origin main || exit_on_error "Git pull failed. Resolve issues manually."
echo -e "Successfully pulled latest code (including updated docker-compose.yml and code refactors)."


# --- Step 3: Stop and Remove Old Docker Services and Volumes ---
section_header "Stopping & Removing Old Docker Services (Local Postgres)"
echo -e "${YELLOW}This will stop all containers and remove old local PostgreSQL data and images.${NC}"
sudo docker-compose down --volumes --rmi all || exit_on_error "Docker Compose down failed"
echo -e "Old Docker services and local Postgres data removed."


# --- Step 4: Start Only the Application Container (Connecting to Neon) ---
section_header "Starting Application Container (Connecting to Neon)"
echo -e "Building new Docker image and starting services..."
# Use --no-deps as DB is external now
sudo docker-compose up --build --no-deps -d app || exit_on_error "Docker Compose up failed"
echo -e "Application container is starting. Please wait a moment..."
sleep 15 # Give app time to fully start


# --- Step 5: Update Nginx Configuration ---
section_header "Updating Nginx Configuration"
echo -e "Testing Nginx configuration syntax..."
sudo nginx -t || exit_on_error "Nginx configuration test failed. Check your Nginx config syntax."
echo -e "Nginx configuration syntax is OK."

echo -e "Reloading Nginx service..."
sudo systemctl reload nginx || exit_on_error "Failed to reload Nginx service. Check 'sudo systemctl status nginx.service' for details."
echo -e "Nginx reloaded successfully."


# --- Step 6: Run Super Diagnostic Check ---
section_header "Running Super Diagnostic Check"
if [ -f "$DIAGNOSTIC_SCRIPT" ]; then
    sudo bash "$DIAGNOSTIC_SCRIPT"
else
    echo -e "${RED}ERROR: Diagnostic script not found at ${DIAGNOSTIC_SCRIPT}. Please ensure it's in your project directory.${NC}"
fi


# --- Final Instructions ---
section_header "Neon Migration & Deployment Complete - FINAL CHECKS"
echo -e "${GREEN}================================================================${NC}"
echo -e "Your RogueSim application should now be configured to connect to Neon PostgreSQL."
echo -e "\n${YELLOW}What to look for in the diagnostic output above:${NC}"
echo -e " - No Docker containers for 'postgres' or 'pgadmin' should be running (only 'roguesim-app-1')."
echo -e " - 'roguesim-app-1' logs should show '🔗 Connected to Neon PostgreSQL (Serverless)'."
echo -e " - 'Curl Host Exposed Port (${APP_HOST_EXPOSED_PORT})' should return '200 OK HTML'."
echo -e " - 'HTTP/HTTPS Connectivity to roguesim.com' should show '200 OK' and correct headers."
echo -e "\n${GREEN}Final Test:${NC}"
echo -e "Open your web browser and navigate to: ${BLUE}https://${DOMAIN}${NC}"
echo -e " - Try registering a new account and logging in to test full database functionality."
echo -e "${GREEN}================================================================${NC}"
echo -e "${GREEN}Script finished. Good luck!${NC}"
