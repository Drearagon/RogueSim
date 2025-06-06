#!/bin/bash

# Super Comprehensive RogueSim Server Diagnostic Script

# --- Configuration ---
DOMAIN="roguesim.com"
APP_CONTAINER_NAME="roguesim-app-1"
DB_CONTAINER_NAME="roguesim-postgres" # Corrected name
PGADMIN_CONTAINER_NAME="roguesim-pgadmin" # Added pgadmin
PROJECT_DIR="/opt/roguesim/RogueSim"
DOCKER_COMPOSE_FILE="${PROJECT_DIR}/docker-compose.yml"

# Set this to the host port you INTEND your app to be exposed on
APP_HOST_EXPOSED_PORT="3001" # <<<--- IMPORTANT: SET THIS TO MATCH YOUR DOCKER-COMPOSE.YML
APP_CONTAINER_INTERNAL_PORT="5000" # <<<--- IMPORTANT: SET THIS TO MATCH YOUR APP'S LISTEN PORT

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

function check_command {
    if ! command -v "$1" &> /dev/null; then
        echo -e "${YELLOW}WARNING: Command '$1' not found. Some checks will be skipped.${NC}"
        return 1
    fi
    return 0
}

function get_container_ip {
    sudo docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "$1" 2>/dev/null
}

# --- Script Start ---
echo -e "${GREEN}Starting Super Comprehensive RogueSim Server Diagnostic...${NC}"
echo -e "${YELLOW}Timestamp: $(date)${NC}"
echo -e "${YELLOW}Running as user: $(whoami)${NC}"

# Ensure we are root
if [ "$(id -u)" -ne 0 ]; then
   echo -e "${RED}ERROR: This script must be run as root. Please use 'sudo bash $0'${NC}"
   exit 1
fi

echo -e "\n${YELLOW}--- Configuration Summary ---${NC}"
echo -e "  Domain: ${DOMAIN}"
echo -e "  App Container: ${APP_CONTAINER_NAME} (internal:${APP_CONTAINER_INTERNAL_PORT}, host:${APP_HOST_EXPOSED_PORT})"
echo -e "  DB Container: ${DB_CONTAINER_NAME}"
echo -e "  PGAdmin Container: ${PGADMIN_CONTAINER_NAME}"
echo -e "  Project Dir: ${PROJECT_DIR}"
echo -e "  Docker Compose File: ${DOCKER_COMPOSE_FILE}"
echo -e "${YELLOW}-----------------------------${NC}"

# --- 1. System Health Checks ---
section_header "System Health Overview"
echo -e "Uptime:"
uptime
echo -e "\nDisk Usage:"
df -h
echo -e "\nMemory Usage:"
free -h
echo -e "\nTop Processes (snapshot):"
top -bn1 | head -n 17 | tail -n +7

# --- 2. Network Configuration & Firewall ---
section_header "Network Configuration & Firewall"
echo -e "IP Addresses:"
ip a | grep -E 'inet\b' | grep -v '127.0.0.1' | awk '{print "  "$2}'

echo -e "\nListening Ports (TCP/UDP on Host):"
if check_command "ss"; then
    sudo ss -tuln
elif check_command "netstat"; then
    sudo netstat -tuln
else
    echo "  Neither 'ss' nor 'netstat' found."
fi

echo -e "\nUFW Firewall Status:"
if check_command "ufw"; then
    sudo ufw status verbose
else
    echo "  UFW not found or not active."
fi

# --- 3. Docker Service & Container Health (LIVE) ---
section_header "Docker Health (LIVE STATUS)"
echo -e "Docker Daemon Status:"
sudo systemctl status docker | grep -E "Active:|Loaded:"

echo -e "\nAll Docker Containers (running or stopped):"
sudo docker ps -a

echo -e "\nDocker Compose Project Status (from ${DOCKER_COMPOSE_FILE}):"
if [ -f "$DOCKER_COMPOSE_FILE" ]; then
    (cd "$PROJECT_DIR" && sudo docker-compose ps)
else
    echo -e "${RED}ERROR: docker-compose.yml not found at ${DOCKER_COMPOSE_FILE}${NC}"
fi

# --- 4. Nginx (Reverse Proxy) Status & Config ---
section_header "Nginx Status & Configuration"
echo -e "Nginx Service Status:"
sudo systemctl status nginx | grep -E "Active:|Loaded:"

echo -e "\nNginx Configuration Test:"
if check_command "nginx"; then
    sudo nginx -t
else
    echo "  Nginx command not found. Cannot test config."
fi

echo -e "\n--- Nginx ACTIVE Configuration for ${DOMAIN} (Relevant Server Block) ---"
NGINX_DUMP=$(sudo nginx -T 2>&1)
if echo "${NGINX_DUMP}" | grep -q "server_name ${DOMAIN}"; then
    echo "${NGINX_DUMP}" | awk '/server {/,/}/' | grep -E "server_name ${DOMAIN}|proxy_pass|listen" | while read -r line; do
        if echo "$line" | grep -q "proxy_pass"; then
            echo -e "  ${GREEN}$line${NC}"
        else
            echo "  $line"
        fi
    done
else
    echo -e "${YELLOW}  No Nginx server block found for ${DOMAIN}. Check your Nginx setup.${NC}"
fi
echo -e "--------------------------------------------------------"

echo -e "\nLast 50 Lines of Nginx Error Log (Recent Errors Only):"
if [ -f "/var/log/nginx/error.log" ]; then
    sudo tail -n 50 /var/log/nginx/error.log | grep -E "error|warn" | grep "$(date +%Y/%m/%d)" || echo "  No errors or warnings in last 50 lines today."
else
    echo -e "${YELLOW}  Nginx error log not found at /var/log/nginx/error.log${NC}"
fi

# --- 5. Internal App Connectivity Checks (CRITICAL) ---
section_header "Internal Application Connectivity (CRITICAL)"

APP_CONTAINER_IP=$(get_container_ip "${APP_CONTAINER_NAME}")
if [ -z "${APP_CONTAINER_IP}" ]; then
    echo -e "${RED}ERROR: ${APP_CONTAINER_NAME} IP not found. Is the container running?${NC}"
else
    echo -e "  App Container IP: ${APP_CONTAINER_IP}"

    echo -e "\n--- Test 1: Curl directly into app container (IP:${APP_CONTAINER_INTERNAL_PORT}) ---"
    echo -e "${YELLOW}  (Should be 200 OK HTML if app is serving correctly internally)${NC}"
    if check_command "curl"; then
        sudo docker exec "${APP_CONTAINER_NAME}" curl -i --connect-timeout 5 http://localhost:"${APP_CONTAINER_INTERNAL_PORT}"/ || \
        echo -e "${RED}  Failed to curl app container directly from inside.${NC} (App might not be running or listening internally)"
    else
        echo "  'curl' not found in container. Skipping direct container test."
    fi

    echo -e "\n--- Test 2: Curl Host Exposed Port (${APP_HOST_EXPOSED_PORT}) ---"
    echo -e "${YELLOW}  (Should be 200 OK HTML if Docker exposed port works and app is listening)${NC}"
    if check_command "curl"; then
        curl -i --connect-timeout 5 http://localhost:"${APP_HOST_EXPOSED_PORT}"/
        if [ $? -ne 0 ]; then
            echo -e "${RED}  Failed to connect to http://localhost:${APP_HOST_EXPOSED_PORT}/ from host. Port might not be exposed or app not responding.${NC}"
        fi
    else
        echo "  'curl' command not found on host."
    fi
fi

# --- 6. Domain & SSL/TLS Connectivity Checks (External) ---
section_header "External Connectivity (Domain & SSL/TLS)"
echo -e "DNS Resolution for ${DOMAIN}:"
if check_command "dig"; then
    dig "${DOMAIN}" +short
else
    echo "  'dig' command not found."
fi

echo -e "\n--- Test 1: HTTP/HTTPS Connectivity to ${DOMAIN} (via Nginx/Cloudflare) ---"
echo -e "${YELLOW}  (Should be 200 OK or 301/302 Redirect to HTTPS)${NC}"
if check_command "curl"; then
    echo -e "  HTTP (redirects):"
    curl -ILk --connect-timeout 10 "http://${DOMAIN}"
    echo -e "\n  HTTPS (SSL/TLS check and redirects):"
    curl -ILk --connect-timeout 10 "https://${DOMAIN}"
else
    echo "  'curl' command not found."
fi

# --- 7. Application Logs (Timed Fetch) ---
section_header "Application Logs (Recent History)"
echo -e "--- ${APP_CONTAINER_NAME} Logs (last 50 lines, captured after a brief wait) ---"
if sudo docker ps -a --format '{{.Names}}' | grep -Eq "^${APP_CONTAINER_NAME}$"; then
    # Give it a moment to potentially crash or log
    sleep 3
    sudo docker logs "${APP_CONTAINER_NAME}" --tail 50
else
    echo -e "${YELLOW}Container ${APP_CONTAINER_NAME} not found or not running. Cannot fetch logs.${NC}"
fi

echo -e "\n--- ${DB_CONTAINER_NAME} Logs (last 50 lines, focusing on errors) ---"
if sudo docker ps -a --format '{{.Names}}' | grep -Eq "^${DB_CONTAINER_NAME}$"; then
    sleep 3
    sudo docker logs "${DB_CONTAINER_NAME}" --tail 50 | grep -E "ERROR|FATAL|warn" || echo "  No recent FATAL/ERROR/WARN found in DB logs."
else
    echo -e "${YELLOW}Container ${DB_CONTAINER_NAME} not found or not running. Cannot fetch logs.${NC}"
fi


# --- Script End ---
echo -e "\n${GREEN}Super Diagnostic Complete. Review the output above for potential issues.${NC}"
echo -e "${YELLOW}Timestamp: $(date)${NC}"
