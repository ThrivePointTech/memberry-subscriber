---
paths:
  - "src/**/*.tsx"
  - "src/**/*.ts"
---

# R2 Asset URLs

The API stores asset paths only (e.g. `staffs/abc123.jpg`). Never render these directly as `<img src>`.

Always call `assetUrl(path)` to prepend `NEXT_PUBLIC_ASSETS_URL`:
```ts
const ASSETS_URL = (process.env.NEXT_PUBLIC_ASSETS_URL ?? "").replace(/\/$/, "");
function assetUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path; // already absolute
  return `${ASSETS_URL}/${path}`;
}
```

`NEXT_PUBLIC_ASSETS_URL` is set in `.env.local` (gitignored) — see `.env.local.example` for the template.
