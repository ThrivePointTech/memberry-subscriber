---
name: Memberry website redesign 2026 (v2 — May 2026)
description: Complete pixel-perfect redesign of memberry-v2 marketing site, new design system, section order, and all components replaced
type: project
---

Full rebuild of `websites/memberry-v2/` completed May 2026. All components replaced with new design spec.

**Why:** New product direction — general small-business membership platform (not laundry-specific). New English copy, new design system, new component visuals.

**How to apply:** The components listed below are the canonical current state. The old Tagalog / laundry-specific content and the old deep-green dark theme are gone.

## Page section order
NavBar → HeroSection → LogoStrip → HowSection (#features) → MathSection → KitSection (#merchant-app) → DealSection (#pricing) → ReframeSection → FaqSection → TeamSection (#team) → CtaSection (#contact) → Footer

LogoStrip is a new component (not in old site).

## Design system (globals.css)
CSS variables:
- `--ink: #142F2D`, `--teal: #35736E`, `--teal-700`, `--teal-300`, `--teal-100`
- `--gold: #C9A84C`, `--gold-700`, `--gold-100`
- `--mint: #F5F8F7` (bg-app), `--white`
- `--ink-90/70/50/30/15` for gray scale
- `--border: #E1E8E5`, `--border-strong`
- Semantic: `--fg-1/2/3`, `--bg-app`, `--bg-surface`

## Font rules
- layout.tsx uses `Space_Grotesk` (var --font-display) + `Inter_Tight` (var --font-body)
- Headings: `var(--font-display)`, weight 600, tight letter-spacing (-0.03em)
- Body: `var(--font-body)`
- **No more Manrope, Plus Jakarta Sans, or Georgia**

## Component notes
- `Icon.tsx` — shared inline SVG icon component, accepts `name | size | strokeWidth | className`
- All phone mockups (KitSection, ReframeSection) are CSS-only with 300×612px frames
- KitSection has 3 alternating rows with DashboardScreen, ScanScreen, AnalyticsScreen
- ReframeSection (dark ink bg) has MemberPhoneFrame showing memberships screen
- CtaSection sends to existing `/api/contact` route (maps email→phone, businessName→business, message→city)
- No `next/image` usage in any new marketing components (all visuals are CSS)

## Styling approach
All 12 marketing components converted from inline React styles to Tailwind CSS v4 utility classes (2026-05-07).
- Breakpoints use `md:` prefix (768px) — no `useIsMobile` hook
- `src/hooks/useIsMobile.ts` deleted
- CSS vars referenced as `text-[var(--ink)]`, `bg-[var(--teal)]` etc.
- Font family: `font-[family-name:var(--font-display)]` / `font-[family-name:var(--font-body)]`
- Inline styles kept only for: `backdropFilter`/`WebkitBackdropFilter` (NavBar scroll), dynamic `transform: rotate(Xdeg)` (PlanCard), dynamic progress bar widths, focus ring `box-shadow`, and per-item dynamic colors from data arrays
- Logo strip media query removed from globals.css (now handled by Tailwind responsive classes)

## Build status
Clean build as of 2026-05-07. No TypeScript errors.
