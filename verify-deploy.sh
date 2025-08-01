#!/bin/bash

set -e

APP_NAME="roguesim"
IMAGE_NAME="roguesim:latest"
DOCKERFILE="Dockerfile"

echo "🔎 Verifying packages and dependencies..."
# Optional: clean slate
rm -rf node_modules
npm install --no-audit --no-fund

# Simple check for known critical packages
REQUIRED_PACKAGES=("vite" "express" "dotenv")
for pkg in "${REQUIRED_PACKAGES[@]}"; do
    if ! npm ls "$pkg" &> /dev/null; then
        echo "❌ ERROR: Package '$pkg' is missing!"
        exit 1
    fi
done
echo "✅ All required packages are installed."

echo "🛠 Building Docker image..."
docker build -t "$IMAGE_NAME" -f "$DOCKERFILE" .

echo "🧹 Stopping and removing old container (if exists)..."
docker stop "$APP_NAME" 2>/dev/null || true
docker rm "$APP_NAME" 2>/dev/null || true

echo "🚀 Starting new container..."
docker run -d \
  --name "$APP_NAME" \
  -p 5000:5000 \
  --env-file .env \
  "$IMAGE_NAME"

echo "📡 Container started. Attaching to logs..."
sleep 2
docker logs -f "$APP_NAME"
