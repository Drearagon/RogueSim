#!/bin/bash

# --- migrate_to_neon_final.sh: Automates Server-Side Migration to Neon Database ---

# This script performs the server-side steps to transition RogueSim to Neon.
# It assumes local code changes have been made and pushed to Git.

# --- Configuration (Adjust if your setup differs) ---
PROJECT_DIR="/opt/roguesim/RogueSim"
ENV_FILE="${PROJECT_DIR}/.env"
DIAGNOSTIC_SCRIPT="${PROJECT_DIR}/super_diagnose.sh" # Path to your super_diagnose.sh

# --- Internal Helper Functions (Do not modify) ---
function _exit_on_error {
    if [ $? -ne 0 ]; then
        echo -e "\nERROR: $1. Script aborted.\n"
        exit 1
    fi
}
function _print_section_header {
    echo -e "\n--- $1 ---\n"
}

# --- Script Start ---
echo -e "Starting automated Neon migration deployment.\n"
echo -e "Timestamp: $(date)\n"

# 1. Check for root privileges
if [ "$(id -u)" -ne 0 ]; then
   echo -e "ERROR: This script must be run as root. Use 'sudo bash $0'.\n"
   exit 1
fi

# 2. Local Checklist Confirmation (Read this carefully!)
_print_section_header "IMPORTANT: LOCAL CHECKLIST (MANUAL STEPS YOU MUST DO BEFORE RUNNING THIS SCRIPT)"
echo -e "This script AUTOMATES SERVER-SIDE DEPLOYMENT. Before running this script,"
echo -e "you MUST complete the following steps LOCALLY and PUSH them to Git:\n"
echo -e "1. Create your Neon project and copy its DATABASE_URL (and note the DB_PASSWORD)."
echo -e "2. Update your LOCAL .env file in your project root:"
echo -e "   - Set DATABASE_URL (to Neon's URL), DB_PASSWORD, SESSION_SECRET (strong random string), and SENDGRID_API_KEY (your actual key)."
echo -e "3. Refactor your application's code in 'server/db.ts', 'server/storage.ts', 'server/routes.ts', and 'server/index.ts'."
echo -e "   - These are the extensive database connection refactoring changes we discussed to fix 'Database not initialized' and 'undefined.query' errors."
echo -e "4. Update your local 'docker-compose.yml':"
echo -e "   - REMOVE the 'postgres' and 'pgadmin' service definitions."
echo -e "   - REMOVE the 'postgres_data' volume definition."
echo -e "   - Ensure 'app' service 'ports' is '8000:5000' (or your chosen exposed host port)."
echo -e "   - Ensure 'env_file: - ./.env' is correctly placed under the 'app' service (and any other remaining services)."
echo -e "5. Run 'npm run db:push' LOCALLY (from your project root, after 'npm install') to apply your schema to the Neon database."
echo -e "6. Commit and Push ALL these local code and config changes to Git."
echo -e "\n"
read -p "Have you completed ALL these LOCAL steps and pushed them to Git? (y/N): " response
if [[ ! "$response" =~ ^[yY]$ ]]; then
    echo -e "Aborting: Please complete the local development and Git push steps first.\n"
    exit 1
fi

# 3. Confirm Server's .env File Existence (No Modification)
_print_section_header "Confirming Server's .env File Existence"
if [ -f "$ENV_FILE" ]; then
    echo -e "Existing .env file found on server (${ENV_FILE}). Using its contents.\n"
    # Basic check for essential variables. No strict validation here.
    if ! grep -q "DATABASE_URL=" "$ENV_FILE" || ! grep -q "DB_PASSWORD=" "$ENV_FILE" || ! grep -q "SESSION_SECRET=" "$ENV_FILE"; then
        echo -e "WARNING: Essential variables (DATABASE_URL, DB_PASSWORD, SESSION_SECRET) might be missing or malformed in ${ENV_FILE}.\n"
        echo -e "Please ensure ${ENV_FILE} contains these lines with correct values, then rerun.\n"
        exit 1
    fi
else
    echo -e "ERROR: .env file not found at ${ENV_FILE}. It must exist on the server with your database credentials.\n"
    echo -e "Please create it manually (${ENV_FILE}) before running this script.\n"
    exit 1
fi


# 4. Navigate to Project Directory & Pull Latest Code
_print_section_header "Navigating to Project Directory & Pulling Latest Code"
cd "$PROJECT_DIR" || _exit_on_error "Failed to navigate to $PROJECT_DIR"
git pull origin main || _exit_on_error "Git pull failed. Resolve issues manually on local and push."
echo -e "Successfully pulled latest code (including updated docker-compose.yml and code refactors).\n"


# 5. Stop and Remove Old Docker Services and Volumes (Local Postgres Cleanup)
_print_section_header "Stopping & Removing Old Docker Services (Local Postgres Cleanup)"
echo -e "This will stop all containers and remove old local PostgreSQL data and images.\n"
sudo docker-compose down --volumes --rmi all || _exit_on_error "Docker Compose down failed"
echo -e "Old Docker services and local Postgres data removed.\n"


# 6. Start Only the Application Container (Connecting to Neon)
_print_section_header "Starting Application Container (Connecting to Neon)"
echo -e "Building new Docker image and starting services...\n"
# --no-deps is crucial here as 'postgres' dependency is removed from docker-compose.yml
# Only 'app' service will be started
sudo docker-compose up --build --no-deps -d app || _exit_on_error "Docker Compose up failed"
echo -e "Application container is starting. Please wait a moment...\n"
sleep 15 # Give app time to fully start


# 7. Update Nginx Configuration
_print_section_header "Updating Nginx Configuration"
echo -e "Testing Nginx configuration syntax...\n"
sudo nginx -t || _exit_on_error "Nginx configuration test failed. Check your Nginx config syntax."
echo -e "Nginx configuration syntax is OK.\n"

echo -e "Reloading Nginx service...\n"
sudo systemctl reload nginx || _exit_on_error "Failed to reload Nginx service. Check 'sudo systemctl status nginx.service' for details."
echo -e "Nginx reloaded successfully.\n"


# 8. Run Super Diagnostic Check
_print_section_header "Running Super Diagnostic Check"
if [ -f "$DIAGNOSTIC_SCRIPT" ]; then
    sudo bash "$DIAGNOSTIC_SCRIPT" || _exit_on_error "Diagnostic script failed"
else
    echo -e "ERROR: Diagnostic script not found at ${DIAGNOSTIC_SCRIPT}. Please ensure it's in your project directory.\n"
    exit 1 # Exit if diagnostic script is missing
fi


# --- Final Instructions ---
_print_section_header "Neon Migration & Deployment Complete - FINAL CHECKS"
echo -e "Your RogueSim application should now be configured to connect to Neon PostgreSQL.\n"
echo -e "What to look for in the diagnostic output above:"
echo -e " - Only 'roguesim-app-1' container should be running (no 'postgres' or 'pgadmin')."
echo -e " - 'roguesim-app-1' logs should show '🔗 Connected to Neon PostgreSQL (Serverless)'."
echo -e " - 'Curl Host Exposed Port (8000)' should return '200 OK HTML'."
echo -e " - 'HTTP/HTTPS Connectivity to roguesim.com' should show '200 OK' and correct headers."
echo -e "\nFinal Test:"
echo -e "Open your web browser and navigate to: https://roguesim.com"
echo -e " - Try registering a new account and logging in to test full database functionality.\n"
echo -e "Script finished. Good luck!\n"
