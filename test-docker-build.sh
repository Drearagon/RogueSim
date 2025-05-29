#!/bin/bash

echo "🧪 Testing Docker Build Process"
echo "==============================="

# Check Docker version for compatibility
echo "🔍 Checking Docker version..."
DOCKER_VERSION=$(docker --version)
echo "Docker version: $DOCKER_VERSION"

# Clean up existing build artifacts
echo "🧹 Cleaning up..."
docker rmi roguesim-test 2>/dev/null || echo "No existing test image"

# Build the Docker image with compatibility for older Docker versions
echo "🏗️ Building Docker image..."
if docker buildx version >/dev/null 2>&1; then
    echo "Using BuildKit with buildx..."
    docker buildx build -t roguesim-test . --no-cache --progress=plain
else
    echo "Using legacy Docker build..."
    docker build -t roguesim-test . --no-cache
fi

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Docker build successful!"
    
    # Test running the container
    echo "🚀 Testing container startup..."
    docker run --rm -p 3001:3000 -d --name roguesim-test-container roguesim-test
    
    if [ $? -eq 0 ]; then
        echo "✅ Container started successfully"
        echo "🔍 Container logs:"
        sleep 3
        docker logs roguesim-test-container
        
        # Stop the test container
        docker stop roguesim-test-container
        echo "🛑 Test container stopped"
    else
        echo "❌ Container failed to start"
    fi
    
else
    echo "❌ Docker build failed"
    echo "🔍 Checking for common issues..."
    echo "- Docker version: $(docker --version)"
    echo "- Available space: $(df -h . | tail -1)"
    echo "- Docker system info:"
    docker system df 2>/dev/null || echo "Could not get Docker system info"
    exit 1
fi

echo "🎉 Test completed" 