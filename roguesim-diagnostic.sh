#!/bin/bash

# Comprehensive Diagnostic Script for RogueSim Server on Hetzner

# --- Configuration ---
DOMAIN="roguesim.com"
APP_CONTAINER_NAME="roguesim-app-1"
DB_CONTAINER_NAME="roguesim-db-1"
PROJECT_DIR="/opt/roguesim/RogueSim" # Assumed path based on your git output
DOCKER_COMPOSE_FILE="${PROJECT_DIR}/docker-compose.yml"

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

# --- Script Start ---
echo -e "${GREEN}Starting comprehensive RogueSim server diagnostic...${NC}"
echo -e "${YELLOW}Timestamp: $(date)${NC}"
echo -e "${YELLOW}Running as user: $(whoami)${NC}"

# Ensure we are root
if [ "$(id -u)" -ne 0 ]; then
   echo -e "${RED}ERROR: This script must be run as root. Please use 'sudo bash $0'${NC}"
   exit 1
fi

# --- 1. System Health Checks ---
section_header "System Health Overview"
echo -e "Uptime:"
uptime
echo -e "\nDisk Usage:"
df -h
echo -e "\nMemory Usage:"
free -h
echo -e "\nTop 10 CPU/Memory Processes (snapshot):"
top -bn1 | head -n 17 | tail -n +7 # Get process list, skipping headers
echo -e "\nSystem Load Average (1, 5, 15 min):"
cat /proc/loadavg | awk '{print "1min: "$1", 5min: "$2", 15min: "$3}'

# --- 2. Network Configuration & Firewall ---
section_header "Network Configuration & Firewall"
echo -e "IP Addresses:"
ip a | grep -E 'inet\b' | grep -v '127.0.0.1' | awk '{print "  "$2}'

echo -e "\nListening Ports (TCP/UDP):"
if check_command "ss"; then
    ss -tuln
elif check_command "netstat"; then
    netstat -tuln
else
    echo "  Neither 'ss' nor 'netstat' found."
fi

echo -e "\nUFW Firewall Status (if active):"
if check_command "ufw"; then
    sudo ufw status verbose
else
    echo "  UFW not found or not in PATH."
fi

echo -e "\nIptables Rules (first 20 lines of each chain, if UFW is not managing):"
if check_command "iptables"; then
    echo "  INPUT Chain:"
    sudo iptables -L INPUT -v -n | head -n 20
    echo "\n  FORWARD Chain:"
    sudo iptables -L FORWARD -v -n | head -n 20
    echo "\n  OUTPUT Chain:"
    sudo iptables -L OUTPUT -v -n | head -n 20
else
    echo "  Iptables not found or not in PATH."
fi

# --- 3. Docker Service & Container Health ---
section_header "Docker Health"
echo -e "Docker Daemon Status:"
sudo systemctl status docker | grep -E "Active:|Loaded:"

echo -e "\nAll Docker Containers (running and stopped):"
sudo docker ps -a

echo -e "\nDocker Compose Project Status (from ${DOCKER_COMPOSE_FILE}):"
if [ -f "$DOCKER_COMPOSE_FILE" ]; then
    (cd "$PROJECT_DIR" && sudo docker-compose ps)
else
    echo -e "${RED}ERROR: docker-compose.yml not found at ${DOCKER_COMPOSE_FILE}${NC}"
fi

echo -e "\nLast 50 Lines of ${APP_CONTAINER_NAME} Logs:"
if sudo docker ps -a --format '{{.Names}}' | grep -Eq "^${APP_CONTAINER_NAME}$"; then
    sudo docker logs "${APP_CONTAINER_NAME}" --tail 50
else
    echo -e "${YELLOW}Container ${APP_CONTAINER_NAME} not found or not running.${NC}"
fi

echo -e "\nLast 50 Lines of ${DB_CONTAINER_NAME} Logs:"
if sudo docker ps -a --format '{{.Names}}' | grep -Eq "^${DB_CONTAINER_NAME}$"; then
    sudo docker logs "${DB_CONTAINER_NAME}" --tail 50
else
    echo -e "${YELLOW}Container ${DB_CONTAINER_NAME} not found or not running.${NC}"
fi

echo -e "\nDocker Networks:"
sudo docker network ls

echo -e "\nDocker Volumes:"
sudo docker volume ls

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

echo -e "\nNginx RogueSim Configuration (/etc/nginx/sites-enabled/roguesim.conf - adjust path if different):"
NGINX_CONF="/etc/nginx/sites-enabled/roguesim.conf" # Common path for sites-enabled
if [ -f "$NGINX_CONF" ]; then
    cat "$NGINX_CONF"
else
    echo -e "${YELLOW}Nginx config file not found at ${NGINX_CONF}. Check your Nginx setup.${NC}"
fi

echo -e "\nLast 50 Lines of Nginx Error Log:"
if [ -f "/var/log/nginx/error.log" ]; then
    tail -n 50 /var/log/nginx/error.log
else
    echo -e "${YELLOW}Nginx error log not found at /var/log/nginx/error.log${NC}"
fi

echo -e "\nLast 50 Lines of Nginx Access Log (for your domain):"
if [ -f "/var/log/nginx/access.log" ]; then
    tail -n 50 /var/log/nginx/access.log | grep "${DOMAIN}"
else
    echo -e "${YELLOW}Nginx access log not found at /var/log/nginx/access.log${NC}"
fi

# --- 5. Domain & SSL/TLS Connectivity Checks ---
section_header "Domain & SSL/TLS Connectivity Checks"
echo -e "DNS Resolution for ${DOMAIN}:"
if check_command "dig"; then
    dig "${DOMAIN}" +short
else
    echo "  'dig' command not found. Install 'dnsutils' for better DNS checks."
    if check_command "ping"; then
        ping -c 1 "${DOMAIN}" | head -n 1 # Basic ping for IP
    fi
fi

echo -e "\nHTTP/HTTPS Connectivity to ${DOMAIN} (from server itself):"
if check_command "curl"; then
    echo -e "  HTTP (redirects):"
    curl -ILk "http://${DOMAIN}"

    echo -e "\n  HTTPS (SSL/TLS check and redirects):"
    curl -ILk "https://${DOMAIN}"

    echo -e "\n  SSL Certificate Details for ${DOMAIN}:"
    # Attempt to get cert details, suppressing errors
    CERT_DETAILS=$(timeout 5 openssl s_client -connect "${DOMAIN}:443" -servername "${DOMAIN}" < /dev/null 2>/dev/null | openssl x509 -text -noout 2>/dev/null)
    if [ -n "$CERT_DETAILS" ]; then
        echo "$CERT_DETAILS" | grep -E "Subject:|Issuer:|Not Before:|Not After:|DNS:"
    else
        echo -e "${YELLOW}  Could not retrieve SSL certificate details. Check port 443 connectivity or cert status.${NC}"
    fi
else
    echo "  'curl' command not found. Cannot perform HTTP/HTTPS checks."
fi

echo -e "\nInternal Connectivity to RogueSim Backend (localhost:3000):"
if check_command "curl"; then
    echo "  Checking /api/health (if exists):"
    curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000/api/health"
    if [ $? -eq 0 ]; then
        echo -e "  Attempting to curl http://localhost:3000/api/health. Expecting 200 or 500 code if endpoint is hit."
        curl "http://localhost:3000/api/health"
    else
        echo -e "${RED}  Failed to connect to http://localhost:3000/api/health. Backend might not be listening.${NC}"
    fi
    echo -e "\n  Checking root / (frontend served by backend?):"
    curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000/"
     if [ $? -eq 0 ]; then
        echo -e "  Attempting to curl http://localhost:3000/. Expecting 200 or 500 code if endpoint is hit."
        curl "http://localhost:3000/" | head -n 10 # Just first 10 lines of HTML
    else
        echo -e "${RED}  Failed to connect to http://localhost:3000/. Frontend might not be served by backend.${NC}"
    fi
else
    echo "  'curl' command not found. Cannot perform internal backend checks."
fi


# --- Script End ---
echo -e "\n${GREEN}Diagnostic complete. Review the output above for potential issues.${NC}"
echo -e "${YELLOW}Timestamp: $(date)${NC}"
