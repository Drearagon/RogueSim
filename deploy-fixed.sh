#!/bin/bash

set -e  # Exit on any error

echo "🚀 RogueSim Docker Fix Deployment"
echo "================================="

# Set your credentials (replace with actual values)
export SENDGRID_API_KEY="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"
export SESSION_SECRET="nZrdLEehQFVTZ9ogVZXxmfpKOe68thkQTtwuVXaokQM="
export DB_PASSWORD="nZrdLEehQFVTZ9ogVZXxmfpKOe68thkQTtwuVXaokQM="

# Update repo
cd /opt/roguesim/RogueSim
git pull origin main

# Create FIXED Dockerfile that installs all deps before building
cat > Dockerfile << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --production
EXPOSE 3000
CMD ["node", "dist/index.js"]
EOF

# Create environment file
cat > .env << EOF
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://roguesim_user:${DB_PASSWORD}@db:5432/roguesim_db
FRONTEND_URL=https://roguesim.com
CORS_ORIGIN=https://roguesim.com,https://www.roguesim.com
SENDGRID_API_KEY=${SENDGRID_API_KEY}
SENDGRID_FROM_EMAIL=uplink@roguesim.com
SENDGRID_FROM_NAME=RogueSim
SESSION_SECRET=${SESSION_SECRET}
COOKIE_DOMAIN=roguesim.com
POSTGRES_DB=roguesim_db
POSTGRES_USER=roguesim_user
POSTGRES_PASSWORD=${DB_PASSWORD}
EOF

# Stop existing containers
docker-compose down 2>/dev/null || true

# Clean build cache
docker system prune -f

# Build and start with fixed Dockerfile
docker-compose up -d --build

echo "✅ Fixed deployment complete!"
echo "🔍 Check with: docker-compose logs -f"
