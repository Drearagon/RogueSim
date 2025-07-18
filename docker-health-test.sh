#!/bin/bash

# Docker health check testing script
# This script builds and tests the Docker container health checks

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CONTAINER_NAME="roguesim-health-test"
IMAGE_NAME="roguesim:test"
TEST_PORT="8080"
HEALTH_CHECK_TIMEOUT=120

echo -e "${BLUE}=== Docker Health Check Test ===${NC}"

# Function to cleanup
cleanup() {
    echo -e "${YELLOW}Cleaning up test containers and images...${NC}"
    docker stop $CONTAINER_NAME 2>/dev/null || true
    docker rm $CONTAINER_NAME 2>/dev/null || true
}

# Function to build test image
build_image() {
    echo -e "${YELLOW}Building test Docker image...${NC}"
    
    if docker build -t $IMAGE_NAME . --no-cache; then
        echo -e "${GREEN}✓ Docker image built successfully${NC}"
        return 0
    else
        echo -e "${RED}✗ Failed to build Docker image${NC}"
        return 1
    fi
}

# Function to run container with health check
run_container() {
    echo -e "${YELLOW}Starting container with health check...${NC}"
    
    # Create minimal .env file for testing
    cat > .env.test << EOF
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
SESSION_SECRET=test-secret-key-for-health-check-testing-only
DATABASE_URL=file:./data/test.db
EOF
    
    # Run container
    docker run -d \
        --name $CONTAINER_NAME \
        -p $TEST_PORT:5000 \
        --env-file .env.test \
        --health-cmd="wget --no-verbose --tries=1 --spider --timeout=10 http://localhost:5000/api/health || exit 1" \
        --health-interval=10s \
        --health-timeout=5s \
        --health-retries=3 \
        --health-start-period=30s \
        $IMAGE_NAME
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Container started successfully${NC}"
        return 0
    else
        echo -e "${RED}✗ Failed to start container${NC}"
        return 1
    fi
}

# Function to monitor health status
monitor_health() {
    echo -e "${YELLOW}Monitoring container health status...${NC}"
    
    local start_time=$(date +%s)
    local timeout=$HEALTH_CHECK_TIMEOUT
    
    while true; do
        local current_time=$(date +%s)
        local elapsed=$((current_time - start_time))
        
        # Check if we've exceeded timeout
        if [ $elapsed -ge $timeout ]; then
            echo -e "${RED}✗ Health check timeout after ${timeout}s${NC}"
            return 1
        fi
        
        # Get container health status
        local health_status=$(docker inspect --format='{{.State.Health.Status}}' $CONTAINER_NAME 2>/dev/null)
        
        echo "Time: ${elapsed}s | Health status: $health_status"
        
        case $health_status in
            "healthy")
                echo -e "${GREEN}✓ Container is healthy!${NC}"
                return 0
                ;;
            "unhealthy")
                echo -e "${RED}✗ Container is unhealthy${NC}"
                return 1
                ;;
            "starting")
                echo "Container is starting... (waiting)"
                ;;
            *)
                echo "Unknown health status: $health_status"
                ;;
        esac
        
        sleep 5
    done
}

# Function to show container logs
show_logs() {
    echo -e "${YELLOW}Container logs:${NC}"
    docker logs $CONTAINER_NAME --tail 50
}

# Function to test application endpoints
test_endpoints() {
    echo -e "${YELLOW}Testing application endpoints...${NC}"
    
    # Test health endpoint
    echo "Testing health endpoint..."
    local health_response=$(curl -s "http://localhost:$TEST_PORT/api/health" 2>/dev/null)
    
    if [ $? -eq 0 ] && echo "$health_response" | grep -q "status"; then
        echo -e "${GREEN}✓ Health endpoint is working${NC}"
        echo "Response: $health_response"
    else
        echo -e "${RED}✗ Health endpoint is not working${NC}"
        return 1
    fi
    
    # Test main endpoint
    echo "Testing main endpoint..."
    local main_response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$TEST_PORT/" 2>/dev/null)
    
    if [ "$main_response" = "200" ]; then
        echo -e "${GREEN}✓ Main endpoint is accessible${NC}"
    else
        echo -e "${YELLOW}⚠ Main endpoint returned status: $main_response${NC}"
    fi
    
    return 0
}

# Main execution
main() {
    echo -e "${BLUE}Starting Docker health check test...${NC}"
    
    # Setup cleanup on exit
    trap cleanup EXIT
    
    # Build image
    if ! build_image; then
        exit 1
    fi
    
    # Run container
    if ! run_container; then
        exit 1
    fi
    
    # Monitor health
    echo -e "${YELLOW}Waiting for container to become healthy...${NC}"
    if monitor_health; then
        echo -e "${GREEN}✓ Health check passed!${NC}"
        
        # Test endpoints
        if test_endpoints; then
            echo -e "${GREEN}✓ All endpoint tests passed!${NC}"
        else
            echo -e "${RED}✗ Some endpoint tests failed${NC}"
        fi
    else
        echo -e "${RED}✗ Health check failed!${NC}"
        show_logs
        exit 1
    fi
    
    # Show final logs
    echo -e "${YELLOW}Final container logs:${NC}"
    show_logs
    
    echo -e "${GREEN}=== Docker health check test completed successfully! ===${NC}"
}

# Execute main function
main "$@"