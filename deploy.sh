#!/bin/bash

<<<<<<< HEAD
set -e  # Exit on error
set -o pipefail

IMAGE_NAME="roguesim-app"
CONTAINER_NAME="roguesim"
DOCKERFILE="Dockerfile"
PORT=5000

echo "🔧 Building Docker image..."
DOCKER_BUILDKIT=1 docker build -f "$DOCKERFILE" -t "$IMAGE_NAME:latest" .

echo "🧹 Stopping and removing old container (if exists)..."
docker rm -f "$CONTAINER_NAME" 2>/dev/null || true

echo "🚀 Starting new container..."
docker run -d \
  --name "$CONTAINER_NAME" \
  -p $PORT:$PORT \
  --env-file .env \
  "$IMAGE_NAME:latest"

echo "📋 Deployment complete. Container logs:"
docker logs -f "$CONTAINER_NAME"
=======
set -e

echo "🚀 Starting RogueSim Docker deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "📋 Please create a .env file with the required environment variables."
    echo "📋 You can use .env.example as a template."
    exit 1
fi

# Source environment variables
source .env

# Validate required environment variables
required_vars=("DATABASE_URL" "SESSION_SECRET")
missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo "❌ Error: Missing required environment variables:"
    printf '  - %s\n' "${missing_vars[@]}"
    echo "📋 Please update your .env file with the missing variables."
    exit 1
fi

echo "✅ Environment variables validated"

# Build and deploy
echo "🔨 Building RogueSim container..."
docker-compose build

echo "🚀 Starting RogueSim..."
docker-compose up -d

echo "⏳ Waiting for health check..."
sleep 10

# Check if the service is healthy
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ RogueSim is running successfully!"
    echo "🌐 Access your app at: http://localhost:8000"
else
    echo "❌ Health check failed. Checking logs..."
    docker-compose logs app
    exit 1
fi

echo "📊 Container status:"
docker-compose ps

echo "🎉 Deployment complete!"
echo "📱 Your RogueSim cyberpunk hacking terminal is ready!"
>>>>>>> 6e938b614b71bced01a32d217f731c71a91f7b7f
