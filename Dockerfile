# ---------- base ----------
FROM node:20-alpine AS base
WORKDIR /app

# ---------- deps ----------
FROM base AS deps
COPY package*.json ./
RUN npm ci

# ---------- build ----------
FROM deps AS build
ARG NODE_ENV=production
ARG VITE_STRIPE_PUBLIC_KEY
ENV NODE_ENV=$NODE_ENV
ENV VITE_STRIPE_PUBLIC_KEY=$VITE_STRIPE_PUBLIC_KEY

COPY . .
RUN npm run build

# Pack only runtime artifacts
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

RUN apk add --no-cache curl

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build     /out/               ./

CMD ["npm", "run", "start"]