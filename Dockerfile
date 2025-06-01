# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

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

# Verify critical dependencies are installed
RUN echo "Verifying @tanstack/react-query installation:" && \
    npm ls @tanstack/react-query || echo "Warning: @tanstack/react-query not found"

# Copy source code
COPY . .

# Build the application with verbose output
RUN echo "Starting build process..." && \
    echo "Current directory:" && pwd && \
    echo "Files in current directory:" && ls -la && \
    echo "Node modules check:" && ls -la node_modules/@tanstack/ || echo "No @tanstack modules found" && \
    echo "Package.json scripts:" && cat package.json | grep -A 10 '"scripts"' && \
    npm run build

# Verify build output
RUN echo "Build completed. Checking dist folder:" && ls -la dist/ || echo "No dist folder found"

# DO NOT prune dev dependencies - keep them for runtime vite imports
# RUN npm prune --production

# Expose port
EXPOSE 5000

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"] 