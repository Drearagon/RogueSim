# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies needed for build)
RUN npm ci

# Verify that vite is installed
RUN echo "Checking if vite is installed..." && npm list vite || echo "Vite not found in direct dependencies"
RUN echo "Checking node_modules..." && ls -la node_modules/.bin/ | grep vite || echo "Vite binary not found"
RUN echo "Trying to run vite directly..." && ./node_modules/.bin/vite --version || echo "Could not run vite"

# Copy source code
COPY . .

# Build the application with more verbose output
RUN echo "Starting build process..." && \
    echo "Current directory:" && pwd && \
    echo "Files in current directory:" && ls -la && \
    echo "Package.json scripts:" && cat package.json | grep -A 10 '"scripts"' && \
    npm run build

# Remove dev dependencies after build
RUN npm prune --production

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"] 