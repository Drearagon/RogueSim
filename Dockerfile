# Multi-stage build for optimal Docker deployment
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install system dependencies needed for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies with better error handling
RUN npm ci --verbose --no-audit --no-fund || \
    (echo "npm ci failed, trying npm install..." && npm install --verbose --no-audit --no-fund)

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Verify build output
RUN echo "=== BUILD VERIFICATION ===" && \
    ls -la dist/ && \
    ls -la dist/public/ && \
    test -f dist/index.js && echo "Server build: OK" || echo "Server build: FAILED" && \
    test -f dist/public/index.html && echo "Client build: OK" || echo "Client build: FAILED"

# Production stage
FROM node:20-alpine AS production

# Install runtime dependencies
RUN apk add --no-cache \
    cairo \
    jpeg \
    pango \
    musl \
    giflib \
    pixman \
    pangomm \
    libjpeg-turbo \
    freetype \
    wget \
    curl

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production --no-audit --no-fund

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/shared ./shared

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S roguesim -u 1001 -G nodejs

# Set ownership
RUN chown -R roguesim:nodejs /app
USER roguesim

# Expose port
EXPOSE 5000

# Copy health check script
COPY docker-health-check.js /usr/local/bin/docker-health-check.js
RUN chmod +x /usr/local/bin/docker-health-check.js

# Health check with Node.js script
HEALTHCHECK --interval=15s --timeout=10s --start-period=30s --retries=5 \
    CMD node /usr/local/bin/docker-health-check.js

# Environment variables
ENV NODE_ENV=production
ENV PORT=5000
ENV HOST=0.0.0.0

# Start the application
CMD ["node", "dist/index.js"]