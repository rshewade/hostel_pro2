# Stage 1: Install dependencies
FROM oven/bun:1.2-alpine AS deps
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Stage 2: Build
FROM oven/bun:1.2-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN apk add --no-cache vips-dev
RUN bun run build

# Stage 3: Production runner
FROM oven/bun:1.2-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Non-root user (security)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Create uploads directory
RUN mkdir -p uploads && chown nextjs:nodejs uploads
VOLUME ["/app/uploads"]

USER nextjs
EXPOSE 3005

CMD ["bun", "server.js"]
