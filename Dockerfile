# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_FOUNDATION_ADDRESS
ARG NEXT_PUBLIC_BOOKING_PRICE_CRC
ARG NEXT_PUBLIC_FRAME_ANCESTOR_ORIGIN

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_FOUNDATION_ADDRESS=$NEXT_PUBLIC_FOUNDATION_ADDRESS
ENV NEXT_PUBLIC_BOOKING_PRICE_CRC=$NEXT_PUBLIC_BOOKING_PRICE_CRC
ENV NEXT_PUBLIC_FRAME_ANCESTOR_ORIGIN=$NEXT_PUBLIC_FRAME_ANCESTOR_ORIGIN

RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
