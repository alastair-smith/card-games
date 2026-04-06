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
# Stage 2: Build the Next.js app
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
RUN pnpm --filter @repo/web build

# ---------------------------------------------------------------------------
# Stage 3: Prune to production-only dependencies via pnpm deploy
# ---------------------------------------------------------------------------
FROM node:22-alpine AS prod-deps
WORKDIR /repo

RUN corepack enable

COPY --from=builder /repo/.tool-versions ./
RUN PNPM_VERSION=$(grep '^pnpm' .tool-versions | awk '{print $2}') && \
    corepack prepare pnpm@${PNPM_VERSION} --activate

COPY --from=builder /repo .

RUN pnpm --filter @repo/web deploy --prod --legacy /deploy

# ---------------------------------------------------------------------------
# Stage 4: Minimal production runtime image
# ---------------------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs nextjs

# App code + production node_modules from pnpm deploy
COPY --from=prod-deps --chown=nextjs:nodejs /deploy ./

# Built Next.js output (not included in pnpm deploy)
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/.next ./.next

USER nextjs

EXPOSE 3000

CMD ["node", "src/server.js"]
