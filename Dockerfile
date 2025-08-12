# ---------- base ----------
FROM node:20-alpine AS base
WORKDIR /app

# ---------- deps ----------
FROM base AS deps
# lockfile-first for caching; switch to pnpm if you use it
COPY package*.json ./
RUN npm ci

# ---------- build ----------
FROM deps AS build
ARG NODE_ENV=production
ARG VITE_STRIPE_PUBLIC_KEY
ENV NODE_ENV=$NODE_ENV
ENV VITE_STRIPE_PUBLIC_KEY=$VITE_STRIPE_PUBLIC_KEY

# bring in source and build (assumes client build -> ./dist)
COPY . .
RUN npm run build

# Package only what we need at runtime into /out
# (Copy conditionally if files/dirs exist)
RUN mkdir -p /out \
 && cp -r dist /out/dist \
 && cp package.json /out/package.json \
 && if [ -f index.js ]; then cp index.js /out/index.js; fi \
 && if [ -f server.js ]; then cp server.js /out/server.js; fi \
 && if [ -d server ]; then cp -r server /out/server; fi

# ---------- prod deps (no dev) ----------
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

# Bring in production deps and the pre-packed app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build     /out/               ./

# Start script must listen on PORT=5000
# If your package.json "start" runs the server, this is perfect.
CMD ["npm", "run", "start"]
