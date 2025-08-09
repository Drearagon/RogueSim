<<<<<<< HEAD
# ---------- BUILD STAGE ----------
=======
# Multi-stage build for optimal Docker deployment
>>>>>>> b9a7eb8a7abe0af8ca800f7898601ebe8927a761
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

<<<<<<< HEAD
# Install native deps (for image/gfx libraries)
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

# Preload package files for caching
COPY package*.json ./

# Install all deps including Vite (important for SSR)
RUN npm install --no-audit --no-fund

# Copy app source
COPY . .

# Build full app
RUN npm run build

# ---------- PRODUCTION STAGE ----------
FROM node:20-alpine AS production

# Install only runtime deps (optimized for SSR)
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
  curl \
  wget

# Set working dir
WORKDIR /app

# Copy deps from builder (includes Vite)
COPY --from=builder /app/node_modules ./node_modules

# Copy built app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/package*.json ./


# Optional: Health check script
COPY docker-health-check.js /usr/local/bin/docker-health-check.js
RUN chmod +x /usr/local/bin/docker-health-check.js

# Create safer non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S roguesim -u 1001 -G nodejs
RUN chown -R roguesim:nodejs /app
USER roguesim

# Expose web port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=15s --timeout=10s --start-period=30s --retries=5 \
  CMD node /usr/local/bin/docker-health-check.js
      
# Runtime env vars
=======
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
>>>>>>> b9a7eb8a7abe0af8ca800f7898601ebe8927a761
ENV NODE_ENV=production
ENV PORT=5000
ENV HOST=0.0.0.0

<<<<<<< HEAD
# Start the app (with SSR support)
CMD ["node", "dist/index.js"]
=======
# Start the application
CMD ["node", "dist/index.js"]
>>>>>>> b9a7eb8a7abe0af8ca800f7898601ebe8927a761
