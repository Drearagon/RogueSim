# Use Node.js 20 Alpine for better compatibility and newer features
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install npm and update to latest version for better dependency resolution
RUN npm install -g npm@latest

# Copy package files first for better caching
COPY package*.json ./

# Clear npm cache and install dependencies with better error handling
RUN npm cache clean --force && \
    npm ci --verbose --no-optional || \
    (echo "npm ci failed, trying npm install..." && npm install --verbose)

# Force install missing rollup dependencies for ARM64/Alpine compatibility
RUN npm install @rollup/rollup-linux-arm64-musl @rollup/rollup-linux-x64-musl --save-optional || echo "Rollup optional dependencies install failed, continuing..."

# Verify critical dependencies are installed
RUN echo "Verifying @tanstack/react-query installation:" && \
    npm ls @tanstack/react-query || echo "Warning: @tanstack/react-query not found"

# Copy source code
COPY . .

# Build the application with verbose output and directory debugging
RUN echo "Starting build process..." && \
    echo "Current directory:" && pwd && \
    echo "Files in current directory:" && ls -la && \
    echo "Node modules check:" && ls -la node_modules/@tanstack/ || echo "No @tanstack modules found" && \
    echo "Package.json scripts:" && cat package.json | grep -A 10 '"scripts"' && \
    echo "Running npm run build..." && \
    npm run build && \
    echo "Build completed successfully!"

# Debug the build output structure
RUN echo "=== BUILD OUTPUT DEBUGGING ===" && \
    echo "Contents of /app:" && ls -la && \
    echo "Contents of /app/dist:" && ls -la dist/ && \
    echo "Contents of /app/dist/public:" && ls -la dist/public/ && \
    echo "Checking for index.html:" && \
    find /app -name "index.html" -type f && \
    echo "=== END BUILD DEBUGGING ==="

# DO NOT prune dev dependencies - keep them for runtime vite imports
# RUN npm prune --production

# Expose port
EXPOSE 5000

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"] 