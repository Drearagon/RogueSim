# ---------- base ----------
FROM node:20-alpine AS base
WORKDIR /app

# ---------- deps ----------
FROM base AS deps
# Copy only dependency manifests first to leverage layer caching
COPY package*.json ./
# If you actually use pnpm or npmrc, uncomment the lines you need:
# COPY pnpm-lock.yaml ./
# COPY .npmrc ./
RUN npm ci

# ---------- build ----------
FROM deps AS build
ARG NODE_ENV=production
ARG VITE_STRIPE_PUBLIC_KEY
ENV NODE_ENV=$NODE_ENV
ENV VITE_STRIPE_PUBLIC_KEY=$VITE_STRIPE_PUBLIC_KEY

# Copy the full source and build
COPY . .
# Ensure this produces client assets in ./dist (adjust if different)
RUN npm run build

# ---------- prod-deps (prune dev) ----------
FROM base AS prod-deps
COPY package*.json ./
RUN npm ci --omit=dev

# ---------- runtime ----------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000
ENV HOST=0.0.0.0

# Healthcheck needs curl
RUN apk add --no-cache curl

# Copy production deps and built app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build     /app/dist        ./dist
COPY --from=build     /app/package.json ./

# If your server entry lives elsewhere, copy it (adjust as needed):
# Example: server code in /server
COPY --from=build     /app/server ./server 2>/dev/null || true
# Or if you have a top-level server file:
# COPY --from=build   /app/index.js ./index.js

# Start script must listen on PORT=5000
CMD ["npm", "run", "start"]
