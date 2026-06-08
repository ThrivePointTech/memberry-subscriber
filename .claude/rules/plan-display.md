---
paths:
  - src/app/shop/**
  - src/app/checkout/**
---

# Plan display locations

Plan data is rendered in two places. Both must be kept in sync whenever plan fields change:

- `src/app/shop/[merchantId]/PlanCard.tsx` — shop listing (first page users see)
- `src/app/checkout/[planId]/page.tsx` — individual checkout page

Each file has its own local `Plan` interface. When adding a new field to plans, update both interfaces and both render paths.
