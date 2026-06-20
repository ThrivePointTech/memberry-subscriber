# Memberry Subscriber — Agent Instructions

@AGENTS.md

## Platform Map

Memberry is a loyalty/subscription platform. All five repositories work together:

| Repo | Stack | Role |
|------|-------|------|
| `memberry-api` | Hono + Node.js + TypeScript + Knex + PostgreSQL | REST API backend |
| `memberry-hq` | Next.js 16 + React 19 + Tailwind | Internal merchant dashboard |
| `memberry-merchant` | Flutter (Dart) | Merchant mobile app (iOS + Android) |
| `memberry-subscriber` | Next.js 16 + React 19 + Tailwind | Subscriber-facing web app ← **this repo** |
| `memberry-steering` | OpenSpec | Cross-project change coordination |

## Stack & Structure

- Next.js 16 App Router, subscriber-facing
- UI: Tailwind v4, Framer Motion, Lucide React, react-qr-code
- Email: Resend (`resend` package)
- Routes: `src/app/checkout/`, `shop/`, `redeem/`, `laundry/`, `merchant-portal/`, `terms/`, `privacy/`
- Run: `npm run dev --webpack` (webpack flag required) · Lint: `npm run lint`
