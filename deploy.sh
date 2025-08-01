#!/bin/bash

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
