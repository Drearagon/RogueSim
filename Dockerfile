# ---------- base ----------
FROM node:20-alpine AS base
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable

WORKDIR /app

# ---------- deps ----------
FROM base AS deps
COPY package.json package-lock.json* pnpm-lock.yaml* .npmrc* ./ 2>/dev/null || true
# Choose the lockfile you actually use:
# RUN pnpm install --frozen-lockfile
RUN npm ci

# ---------- build ----------
FROM deps AS build
ARG NODE_ENV=production
ARG VITE_STRIPE_PUBLIC_KEY
ENV NODE_ENV=$NODE_ENV
# Expose any other VITE_* here as needed:
ENV VITE_STRIPE_PUBLIC_KEY=$VITE_STRIPE_PUBLIC_KEY

# Copy the rest and build
COPY . .
# If you have separate client/server, ensure your build script builds the client bundle.
# Must produce static assets under ./dist or similar.
RUN npm run build

# ---------- prod-deps (prune dev) ----------
FROM base AS prod-deps
COPY package.json package-lock.json* pnpm-lock.yaml* .npmrc* ./ 2>/dev/null || true
# RUN pnpm install --frozen-lockfile --prod
RUN npm ci --omit=dev

# ---------- runtime ----------
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000
ENV HOST=0.0.0.0

# Copy production node_modules and built app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build     /app/dist        ./dist
COPY --from=build     /app/package.json ./
# If your server files are outside /dist (e.g., src/server or server.js), copy them:
# COPY --from=build   /app/server ./server
# COPY --from=build   /app/build  ./build
# Or, if the app runs from root JS files:
COPY --from=build     /app/*.js . 2>/dev/null || true
COPY --from=build     /app/server ./server 2>/dev/null || true

# Healthcheck needs curl
RUN apk add --no-cache curl

# If your start script handles serving the built client + API, this is perfect.
# Otherwise, adjust to your actual entrypoint.
CMD ["npm", "run", "start"]
