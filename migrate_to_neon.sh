#!/bin/bash

# Proper Script to Automate Server-Side Migration to Neon Database

# --- Configuration ---
PROJECT_DIR="/opt/roguesim/RogueSim"
ENV_FILE="${PROJECT_DIR}/.env"
DIAGNOSTIC_SCRIPT="${PROJECT_DIR}/super_diagnose.sh" # Path to your super_diagnose.sh

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

# --- Pre-Run Checklist Reminder (Informational Only - Not Executable) ---
section_header "IMPORTANT: LOCAL CHECKLIST (MANUAL STEPS TO DO BEFORE RUNNING THIS SCRIPT)"
echo -e "${YELLOW}================================================================${NC}"
echo -e "This script AUTOMATES SERVER-SIDE DEPLOYMENT. Before running this script,"
echo -e "you MUST complete the following steps LOCALLY and PUSH them to Git:"
echo -e " "
echo -e "1.  ${GREEN}Create Neon Project & Get Credentials:${NC}"
echo -e "    - Create your Neon project (at neon.tech) and copy its DATABASE_URL (and note the DB_PASSWORD)."
echo -e " "
echo -e "2.  ${GREEN}Update Local .env File:${NC}"
echo -e "    - Open ${ENV_FILE} LOCALLY and update DATABASE_URL (to Neon's URL), DB_PASSWORD,"
echo -e "      SESSION_SECRET (to a strong random string), and SENDGRID_API_KEY (to your actual key)."
echo -e " "
echo -e "3.  ${GREEN}Refactor Application Code (DB/Storage/Routes/Index):${NC}"
echo -e "    - ${BLUE}server/db.ts:${NC} Refactor to use `let initializedDb/Pool`, export `getDb()/getPool()` functions, and `initDatabase()` handles initialization."
echo -e "    - ${BLUE}server/storage.ts:${NC} Refactor to export `DatabaseStorage` CLASS. Its constructor must accept `drizzleDb` and `rawPool`."
echo -e "    - ${BLUE}server/routes.ts:${NC} Import `getDb, getPool, DatabaseStorage`. Instantiate `storage = new DatabaseStorage(getDb(), getPool());` *inside* `registerRoutes`."
echo -e "    - ${BLUE}server/index.ts:${NC} Ensure `await initDatabase();` is called and awaited *before* `registerRoutes(app)`."
echo -e " "
echo -e "4.  ${GREEN}Update local docker-compose.yml:${NC}"
echo -e "    - REMOVE the `postgres` and `pgadmin` service definitions."
echo -e "    - REMOVE the `postgres_data` volume definition."
echo -e "    - Ensure `app` service `ports` is `8000:5000` (or your chosen exposed host port)."
echo -e "    - Ensure `env_file: - ./.env` is correctly placed under the `app` service."
echo -e " "
echo -e "5.  ${GREEN}Run 'npm run db:push' LOCALLY:${NC}"
echo -e "    - Run this command from your local project root (`npm install` then `npm run db:push`)."
echo -e "    - This will apply your database schema to the Neon database."
echo -e " "
echo -e "6.  ${GREEN}Commit and Push ALL These Local Changes to Git:${NC}"
echo -e "    - `git add . && git commit -m 'Neon migration complete' && git push origin main`"
echo -e "${YELLOW}================================================================${NC}"
read -p "Have you completed ALL these LOCAL steps and pushed them to Git? (y/N): " response
if [[ ! "$response" =~ ^[yY]$ ]]; then
    echo -e "${RED}Aborting: Please complete the local development and Git push steps first.${NC}"
    exit 1
fi

# --- Step 1: Update Server's .env if necessary, else confirm its existence ---
section_header "Confirming Server's .env File"
if [ -f "$ENV_FILE" ]; then
    echo -e "${GREEN}Existing .env file found on server (${ENV_FILE}). Using its contents.${NC}"
    # Optional: Verify essential variables exist.
    if ! grep -q "DATABASE_URL=" "$ENV_FILE" || ! grep -q "DB_PASSWORD=" "$ENV_FILE" || ! grep -q "SESSION_SECRET=" "$ENV_FILE"; then
        echo -e "${YELLOW}WARNING: Essential variables (DATABASE_URL, DB_PASSWORD, SESSION_SECRET) might be missing or malformed in ${ENV_FILE}.${NC}"
        echo -e "${YELLOW}Please ensure ${ENV_FILE} contains these exact lines with correct values, then rerun.${NC}"
        exit 1
    fi
else
    echo -e "${RED}ERROR: .env file not found at ${ENV_FILE}. It must exist on the server with your database credentials.${NC}"
    echo -e "${RED}Please create it manually (${ENV_FILE}) before running this script.${NC}"
    exit 1
fi


# --- Step 2: Navigate to Project Directory & Pull Latest Code ---
section_header "Navigating to Project Directory & Pulling Latest Code"
cd "$PROJECT_DIR" || exit_on_error "Failed to navigate to $PROJECT_DIR"
git pull origin main || exit_on_error "Git pull failed. Resolve issues manually on local and push."
echo -e "Successfully pulled latest code (including updated docker-compose.yml and code refactors)."


# --- Step 3: Stop and Remove Old Docker Services and Volumes ---
section_header "Stopping & Removing Old Docker Services (Local Postgres)"
echo -e "${YELLOW}This will stop all containers and remove old local PostgreSQL data and images.${NC}"
# Use --volumes --rmi all to ensure old postgres data and images are completely gone
sudo docker-compose down --volumes --rmi all || exit_on_error "Docker Compose down failed"
echo -e "Old Docker services and local Postgres data removed."


# --- Step 4: Start Only the Application Container (Connecting to Neon) ---
section_header "Starting Application Container (Connecting to Neon)"
echo -e "Building new Docker image and starting services..."
# --no-deps is crucial here as 'postgres' dependency is removed from docker-compose.yml
# only 'app' service will be started
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
    exit 1 # Exit if diagnostic script is missing
fi


# --- Final Instructions ---
section_header "Neon Migration & Deployment Complete - FINAL CHECKS"
echo -e "${GREEN}================================================================${NC}"
echo -e "Your RogueSim application should now be configured to connect to Neon PostgreSQL."
echo -e "\n${YELLOW}What to look for in the diagnostic output above:${NC}"
echo -e " - Only 'roguesim-app-1' container should be running (no 'postgres' or 'pgadmin')."
echo -e " - 'roguesim-app-1' logs should show '🔗 Connected to Neon PostgreSQL (Serverless)'."
echo -e " - 'Curl Host Exposed Port (${APP_HOST_EXPOSED_PORT})' should return '200 OK HTML'."
echo -e " - 'HTTP/HTTPS Connectivity to roguesim.com' should show '200 OK' and correct headers."
echo -e "\n${GREEN}Final Test:${NC}"
echo -e "Open your web browser and navigate to: ${BLUE}https://${DOMAIN}${NC}"
echo -e " - Try registering a new account and logging in to test full database functionality."
echo -e "${GREEN}================================================================${NC}"
echo -e "${GREEN}Script finished. Good luck!${NC}"
