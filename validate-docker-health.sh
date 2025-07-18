#!/bin/bash

# Docker Health Check Validation Script
# This script validates that Docker health checks work correctly

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CONTAINER_NAME="roguesim-test-health"
IMAGE_NAME="roguesim:health-test"
TEST_PORT="8001"

echo -e "${BLUE}=== Docker Health Check Validation ===${NC}"

# Function to cleanup
cleanup() {
    echo -e "${YELLOW}Cleaning up...${NC}"
    docker stop $CONTAINER_NAME 2>/dev/null && echo "Container stopped"
    docker rm $CONTAINER_NAME 2>/dev/null && echo "Container removed"
    docker rmi $IMAGE_NAME 2>/dev/null && echo "Test image removed"
    rm -f .env.test
}

# Setup cleanup on exit
trap cleanup EXIT

# Function to check if docker is available
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}✗ Docker is not installed or not in PATH${NC}"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        echo -e "${RED}✗ Docker daemon is not running${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Docker is available${NC}"
}

# Function to create test environment
create_test_env() {
    echo -e "${YELLOW}Creating test environment...${NC}"
    
    cat > .env.test << EOF
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
SESSION_SECRET=test-secret-key-minimum-32-characters-long-for-testing
DATABASE_URL=file:./data/test.db
SENDGRID_API_KEY=
STRIPE_SECRET_KEY=
VITE_STRIPE_PUBLIC_KEY=
FROM_EMAIL=test@example.com
EOF
    
    echo -e "${GREEN}✓ Test environment created${NC}"
}

# Function to build Docker image
build_image() {
    echo -e "${YELLOW}Building Docker image...${NC}"
    
    if docker build -t $IMAGE_NAME . --progress=plain 2>&1; then
        echo -e "${GREEN}✓ Docker image built successfully${NC}"
        return 0
    else
        echo -e "${RED}✗ Failed to build Docker image${NC}"
        return 1
    fi
}

# Function to run container
run_container() {
    echo -e "${YELLOW}Starting container...${NC}"
    
    docker run -d \
        --name $CONTAINER_NAME \
        -p $TEST_PORT:5000 \
        --env-file .env.test \
        $IMAGE_NAME
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Container started successfully${NC}"
        return 0
    else
        echo -e "${RED}✗ Failed to start container${NC}"
        return 1
    fi
}

# Function to wait for container to be healthy
wait_for_health() {
    echo -e "${YELLOW}Waiting for container to become healthy...${NC}"
    
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        local health_status=$(docker inspect --format='{{.State.Health.Status}}' $CONTAINER_NAME 2>/dev/null)
        
        echo "Attempt $((attempt + 1))/$max_attempts: Health status = $health_status"
        
        case $health_status in
            "healthy")
                echo -e "${GREEN}✓ Container is healthy!${NC}"
                return 0
                ;;
            "unhealthy")
                echo -e "${RED}✗ Container became unhealthy${NC}"
                return 1
                ;;
            "starting")
                echo "Container is starting..."
                ;;
            *)
                echo "Unknown health status: $health_status"
                ;;
        esac
        
        attempt=$((attempt + 1))
        sleep 5
    done
    
    echo -e "${RED}✗ Container failed to become healthy within timeout${NC}"
    return 1
}

# Function to test health endpoint directly
test_health_endpoint() {
    echo -e "${YELLOW}Testing health endpoint directly...${NC}"
    
    # Test basic health endpoint
    local response=$(curl -s -w "%{http_code}" -o /tmp/health_response.json "http://localhost:$TEST_PORT/api/health" 2>/dev/null)
    local http_code=${response: -3}
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓ Health endpoint returned HTTP 200${NC}"
        
        # Check response content
        if grep -q '"status":"healthy"' /tmp/health_response.json; then
            echo -e "${GREEN}✓ Health endpoint returned healthy status${NC}"
        else
            echo -e "${RED}✗ Health endpoint did not return healthy status${NC}"
            cat /tmp/health_response.json
            return 1
        fi
    else
        echo -e "${RED}✗ Health endpoint returned HTTP $http_code${NC}"
        return 1
    fi
    
    return 0
}

# Function to show container logs
show_logs() {
    echo -e "${YELLOW}Container logs (last 50 lines):${NC}"
    docker logs $CONTAINER_NAME --tail 50
}

# Function to show health check logs
show_health_logs() {
    echo -e "${YELLOW}Health check logs:${NC}"
    docker inspect --format='{{range .State.Health.Log}}{{.Output}}{{end}}' $CONTAINER_NAME
}

# Main execution
main() {
    echo -e "${BLUE}Starting Docker health check validation...${NC}"
    
    # Check prerequisites
    check_docker
    
    # Create test environment
    create_test_env
    
    # Build image
    echo -e "${YELLOW}Building Docker image...${NC}"
    if ! build_image; then
        echo -e "${RED}Build failed. Exiting.${NC}"
        exit 1
    fi
    
    # Run container
    if ! run_container; then
        echo -e "${RED}Container start failed. Exiting.${NC}"
        exit 1
    fi
    
    # Wait a bit for container to initialize
    echo -e "${YELLOW}Waiting for container to initialize...${NC}"
    sleep 10
    
    # Test health endpoint directly
    if ! test_health_endpoint; then
        echo -e "${RED}Direct health endpoint test failed${NC}"
        show_logs
        exit 1
    fi
    
    # Wait for Docker health check to pass
    if wait_for_health; then
        echo -e "${GREEN}✓ Docker health check validation passed!${NC}"
        show_health_logs
    else
        echo -e "${RED}✗ Docker health check validation failed${NC}"
        show_logs
        show_health_logs
        exit 1
    fi
    
    echo -e "${GREEN}=== Validation completed successfully! ===${NC}"
}

# Execute main function
main "$@"