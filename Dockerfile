# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Stage 1: Install all dependencies
# ---------------------------------------------------------------------------
FROM node:22-alpine AS deps
WORKDIR /repo

RUN corepack enable

COPY .tool-versions ./
RUN PNPM_VERSION=$(grep '^pnpm' .tool-versions | awk '{print $2}') && \
    corepack prepare pnpm@${PNPM_VERSION} --activate

# Copy workspace manifests first for layer-cache efficiency
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/web/package.json apps/web/

RUN pnpm install --frozen-lockfile

# ---------------------------------------------------------------------------
# Stage 2: Build the Next.js app + extract production dependencies
# ---------------------------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /repo

RUN corepack enable

COPY --from=deps /repo/.tool-versions ./
RUN PNPM_VERSION=$(grep '^pnpm' .tool-versions | awk '{print $2}') && \
    corepack prepare pnpm@${PNPM_VERSION} --activate

COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/apps/web/node_modules ./apps/web/node_modules
COPY . .

ENV SKIP_ENV_VALIDATION=true
ARG NEXT_PUBLIC_GIT_COMMIT_HASH=unknown
ENV NEXT_PUBLIC_GIT_COMMIT_HASH=$NEXT_PUBLIC_GIT_COMMIT_HASH
RUN pnpm --filter @repo/web build

# Extract production-only dependencies for the custom server
RUN pnpm --filter @repo/web deploy --prod --legacy /prod-deps

# ---------------------------------------------------------------------------
# Stage 3: Minimal production runtime image
# ---------------------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs nextjs

# Standalone output (includes server code + traced node_modules)
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/.next/standalone ./

# Static assets (not included in standalone trace)
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/.next/static ./apps/web/.next/static

# Public assets
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/public ./apps/web/public

# Custom server + env validation (not included in standalone trace)
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/src/server.js ./apps/web/src/server.js
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/src/env.js ./apps/web/src/env.js

# Production dependencies for the custom server (standalone doesn't trace these)
COPY --from=builder --chown=nextjs:nodejs /prod-deps/node_modules ./apps/web/node_modules

WORKDIR /app/apps/web

USER nextjs

EXPOSE 3000

CMD ["node", "src/server.js"]
