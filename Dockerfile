# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies needed for runtime)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN echo "Starting build process..." && \
    echo "Current directory:" && pwd && \
    echo "Files in current directory:" && ls -la && \
    echo "Package.json scripts:" && cat package.json | grep -A 10 '"scripts"' && \
    npm run build

# Verify build output
RUN echo "Build completed. Checking dist folder:" && ls -la dist/ || echo "No dist folder found"

# DO NOT prune dev dependencies - keep them for runtime vite imports
# RUN npm prune --production

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"] 