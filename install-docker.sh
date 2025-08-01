#!/bin/bash
set -e

echo "🧼 Removing Ubuntu's default Docker packages (if installed)..."
sudo apt remove -y docker.io containerd runc || true

echo "📦 Installing dependencies..."
sudo apt update
sudo apt install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    apt-transport-https \
    software-properties-common

echo "🔐 Adding Docker GPG key..."
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
    sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo "➕ Adding Docker official repository..."
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

echo "🔄 Updating package index..."
sudo apt update

echo "📥 Installing Docker CE, CLI, containerd, and buildx plugin..."
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin

echo "✅ Enabling BuildKit..."
sudo mkdir -p /etc/docker
echo '{ "features": { "buildkit": true } }' | sudo tee /etc/docker/daemon.json > /dev/null

echo "🔁 Restarting Docker service..."
sudo systemctl restart docker

echo "🔍 Verifying Docker installation..."
docker --version
docker buildx version

echo "✅ Docker with Buildx is installed and configured properly!"
