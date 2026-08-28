# ─── Stage 1: Dependencies ────────────────────────────────────
# Install only production dependencies to keep final image small.
FROM node:20-alpine AS deps

# Build tools for native modules (bcrypt compiles from source on musl/Alpine)
RUN apk add --no-cache python3 make g++

RUN corepack enable && corepack prepare pnpm@10.12.1 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --prod

# ─── Stage 2: Build ──────────────────────────────────────────
# Install all dependencies (including devDeps) and compile TypeScript.
FROM node:20-alpine AS build

RUN corepack enable && corepack prepare pnpm@10.12.1 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY tsconfig.json ./
COPY src/ ./src/

RUN pnpm run build

# ─── Stage 3: Runner ─────────────────────────────────────────
# Minimal production image: only compiled JS + prod dependencies.
FROM node:20-alpine AS runner

RUN corepack enable && corepack prepare pnpm@10.12.1 --activate

# Security: run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy production node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy compiled output from build stage
COPY --from=build /app/dist ./dist

# Copy package.json (needed to resolve bins)
COPY package.json ./

# Copy source files — needed at runtime because migrations/seeders run via tsx.
# Umzug reads .ts migration files, and database.ts imports models from src/modules.
COPY src/ ./src/
COPY tsconfig.json ./

# Copy bootstrap script
COPY scripts/ ./scripts/

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/v1/health || exit 1

# Start with bootstrap (migrations + seed + server)
CMD ["node", "scripts/bootstrap.mjs"]
