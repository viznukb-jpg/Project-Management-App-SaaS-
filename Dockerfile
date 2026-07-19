# ---- Stage 1: Install dependencies ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# ---- Stage 2: Build the Next.js application ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build args become env at build time
ARG DATABASE_URL="postgresql://postgres:password@localhost:5432/postgres"
ARG REDIS_URL="redis://localhost:6379"
ARG AUTH_SECRET
# AUTH_SECRET has no default — must be supplied at build time or via env_file at runtime
ARG BETTER_AUTH_URL="http://localhost:3000"
ARG NEXT_PUBLIC_APP_URL="http://localhost:3000"
ARG NEXT_PUBLIC_SUPABASE_URL="https://dummy.supabase.co"
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY="dummy-anon-key"

ENV DATABASE_URL=$DATABASE_URL
ENV REDIS_URL=$REDIS_URL
ENV AUTH_SECRET=$AUTH_SECRET
ENV BETTER_AUTH_URL=$BETTER_AUTH_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

RUN npm run build

# ---- Stage 3: Production runner ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy only what's needed
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy drizzle migrations & server files for worker mode
# node_modules is needed here because the worker runs tsx (TypeScript) at runtime
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/src ./src
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
# Note: .next/standalone already contains its own trimmed node_modules for the web server;
# the full node_modules above is only required by the worker (tsx runtime).

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
