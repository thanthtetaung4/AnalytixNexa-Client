# syntax=docker/dockerfile:1

# ------------------------------------------------------------------ deps ---
# Dependencies live in the image so a fresh named volume for /app/node_modules
# is seeded from here on first `up`, instead of a cold install at boot.
FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# ------------------------------------------------------------------- dev ---
# The Vite dev server. docker-compose bind-mounts the source over /app, so the
# COPY here only matters when the image is run without that mount.
FROM deps AS dev

COPY . .

ENV NODE_ENV=development
EXPOSE 5173

# `npm install` first: the node_modules volume outlives image rebuilds, so this
# is what picks up a changed package.json without a manual `make reset`. It is
# a fast no-op once the volume is in sync.
CMD ["sh", "-c", "npm install --no-audit --no-fund && exec npm run dev -- --host 0.0.0.0 --port 5173"]

# ----------------------------------------------------------------- build ---
# The production bundle. VITE_* values are read at build time and baked into
# the JavaScript, so anything environment-specific has to arrive here as a
# build argument rather than as a runtime variable.
#
# Deliberately absent: VITE_API_BASE_URL and VITE_OTLP_ENDPOINT. Both default
# to same-origin paths (/api/v1 and /otlp) which the edge proxy routes onward,
# so the built image carries no hostname and the same artifact runs against any
# domain.
FROM deps AS build

ARG VITE_TELEMETRY_ENABLED=true
ARG VITE_DEPLOY_ENV=production
ARG VITE_SERVICE_NAME=analytixnexa-client
ENV VITE_TELEMETRY_ENABLED=$VITE_TELEMETRY_ENABLED \
    VITE_DEPLOY_ENV=$VITE_DEPLOY_ENV \
    VITE_SERVICE_NAME=$VITE_SERVICE_NAME

COPY . .
RUN npm run build

# ------------------------------------------------------------------ prod ---
# Static files behind nginx. No Node in the final image: the runtime needs to
# serve four files, not build them.
FROM nginx:1.27-alpine AS prod

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY security-headers.conf /etc/nginx/snippets/security-headers.conf

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --spider -q http://127.0.0.1/ || exit 1
