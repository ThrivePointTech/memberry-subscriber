# ---- deps ----
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci


# ---- builder ----
FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Inlined into the bundle at build time by Next.js — must be build args,
# not runtime env vars.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_ASSETS_URL
ARG NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY
ARG NEXT_PUBLIC_POSTHOG_KEY
ARG NEXT_PUBLIC_POSTHOG_HOST
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_ASSETS_URL=${NEXT_PUBLIC_ASSETS_URL}
ENV NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY=${NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY}
ENV NEXT_PUBLIC_POSTHOG_KEY=${NEXT_PUBLIC_POSTHOG_KEY}
ENV NEXT_PUBLIC_POSTHOG_HOST=${NEXT_PUBLIC_POSTHOG_HOST}

# Not a NEXT_PUBLIC_ var (stays a dynamic runtime lookup, not inlined), but
# `next build`'s page-data collection step evaluates route modules eagerly,
# and src/app/api/contact/route.ts constructs `new Resend(...)` at module
# scope, which throws if the key is empty. A build-time placeholder is
# enough to satisfy that — the real value from `environment:` at container
# runtime is what actually takes effect for requests.
ARG RESEND_API_KEY=build-placeholder-key
ENV RESEND_API_KEY=${RESEND_API_KEY}

RUN npm run build


# ---- runner ----
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
