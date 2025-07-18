#!/bin/bash

# Health check script for Docker container
# This script tests if the application is running and healthy

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
HOST="localhost"
PORT="${PORT:-5000}"
HEALTH_ENDPOINT="/api/health"
MAX_RETRIES=10
RETRY_DELAY=2

echo -e "${YELLOW}Starting health check for RogueSim application...${NC}"

# Function to test endpoint
test_endpoint() {
    local url="$1"
    local expected_status="$2"
    
    echo "Testing endpoint: $url"
    
    # Use curl with timeout and retry
    response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null)
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✓ Endpoint $url responded with status $response${NC}"
        return 0
    else
        echo -e "${RED}✗ Endpoint $url responded with status $response (expected $expected_status)${NC}"
        return 1
    fi
}

# Function to wait for application to start
wait_for_app() {
    local retries=0
    local url="http://$HOST:$PORT$HEALTH_ENDPOINT"
    
    echo "Waiting for application to start..."
    
    while [ $retries -lt $MAX_RETRIES ]; do
        echo "Attempt $((retries + 1))/$MAX_RETRIES..."
        
        if test_endpoint "$url" "200"; then
            echo -e "${GREEN}✓ Application is healthy!${NC}"
            return 0
        fi
        
        retries=$((retries + 1))
        if [ $retries -lt $MAX_RETRIES ]; then
            echo "Waiting ${RETRY_DELAY}s before next attempt..."
            sleep $RETRY_DELAY
        fi
    done
    
    echo -e "${RED}✗ Application failed to become healthy after $MAX_RETRIES attempts${NC}"
    return 1
}

# Function to run comprehensive health check
run_health_check() {
    echo -e "${YELLOW}Running comprehensive health check...${NC}"
    
    # Test health endpoint
    if ! test_endpoint "http://$HOST:$PORT$HEALTH_ENDPOINT" "200"; then
        return 1
    fi
    
    # Test that it returns JSON
    response=$(curl -s "http://$HOST:$PORT$HEALTH_ENDPOINT" 2>/dev/null)
    if echo "$response" | grep -q "status"; then
        echo -e "${GREEN}✓ Health endpoint returns valid JSON${NC}"
    else
        echo -e "${RED}✗ Health endpoint does not return valid JSON${NC}"
        return 1
    fi
    
    # Test main app endpoint
    if test_endpoint "http://$HOST:$PORT/" "200"; then
        echo -e "${GREEN}✓ Main application endpoint is accessible${NC}"
    else
        echo -e "${YELLOW}⚠ Main application endpoint returned non-200 status${NC}"
    fi
    
    return 0
}

# Main execution
main() {
    echo -e "${YELLOW}=== RogueSim Health Check ===${NC}"
    echo "Host: $HOST"
    echo "Port: $PORT"
    echo "Health Endpoint: $HEALTH_ENDPOINT"
    echo ""
    
    # Wait for app to start
    if ! wait_for_app; then
        echo -e "${RED}Health check failed - application did not start properly${NC}"
        exit 1
    fi
    
    # Run comprehensive health check
    if run_health_check; then
        echo -e "${GREEN}=== Health check passed! ===${NC}"
        exit 0
    else
        echo -e "${RED}=== Health check failed! ===${NC}"
        exit 1
    fi
}

# Execute main function
main "$@"