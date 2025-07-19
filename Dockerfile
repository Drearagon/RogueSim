# ---------- BUILD STAGE ----------
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

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
ENV NODE_ENV=production
ENV PORT=5000
ENV HOST=0.0.0.0

# Start the app (with SSR support)
CMD ["node", "dist/index.js"]
