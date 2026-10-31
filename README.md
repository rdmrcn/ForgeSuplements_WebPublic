# FORGE — premium sports nutrition storefront (demo)

FORGE is a **fictional** sports nutrition brand built as a complete, locally runnable e-commerce portfolio project. The name is provisional and has **not** been trademark-cleared. All brand text, packaging art and imagery are original.

> **Demo store.** No payment is taken, no card data is collected, nothing ships. Checkout creates a local demo order marked `not_charged_demo` / `not_fulfilled`.

## Stack

- Next.js 16 (App Router, Turbopack), React 19, strict TypeScript
- Tailwind CSS 4, Lucide icons, `next/font` (Big Shoulders, Instrument Serif, Geist)
- Zustand (persisted cart, favourites, recently viewed), react-hook-form + zod
- Vitest (unit) and Playwright (end-to-end)

## Run locally

Prerequisites: Node.js 20+ and npm. Playwright tests use a system Chrome (`PW_CHANNEL` overrides the channel).

```bash
npm install
cp .env.example .env.local   # optional
npm run dev -- -p 4317       # http://localhost:4317
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest unit tests |
| `npm run test:e2e` | Playwright; builds and serves on port 4318 (desktop and mobile projects) |
| `npm run check` | lint + typecheck + unit tests |

## Environment variables

See `.env.example`. Placeholders only; there are no secrets.

- `NEXT_PUBLIC_SITE_URL` — canonical origin for metadata, sitemap and JSON-LD.
- `PAYMENT_PROVIDER` — only `demo` is implemented; any other value throws.
- `ASSISTANT_LLM_API_KEY` (optional) — enables AI phrasing in the help desk; see Features.
- `ORDER_STORE_PATH` — demo order file (default `.data/orders.json`, git-ignored; memory fallback if unwritable).

## Features

- 14 products with flavours/sizes, per-variant stock, ingredients, illustrative nutrition tables, directions, warnings and related products. No health claims, certifications or testimonials.
- Shop by goal (Muscle Gain, Mass & Weight Gain, Fat Burn, Performance, Health). Goals are defined in `src/domain/catalog/goals.ts` and tagged per product via `goals`; picking one narrows the grid and offers product-type chips (e.g. Performance → Pre-Workout, Creatine, Amino Acids, Carnitine & Energy). Fat Burn and health copy avoids efficacy claims.
- Daily deal on the homepage (`src/config/deals.ts`): the new Creatine Monohydrate Blueberry, 300 g, at a demo discount.
- Shop with filters (goal, type, flavour, size, availability, price), sort, URL-synced state, search with scoring, favourites, recently viewed.
- Cart drawer and page, stock-aware quantities (max 10 per line), discount codes (`FORGE10`, `WELCOME5`, `FREESHIP`), free-shipping meter.
- Three-step checkout with country-specific address forms for TR, US, CA, DE, AT and GB (Türkiye province/district with partial-data fallback).
- Illustrative, configurable shipping (`src/config/shipping.ts`).
- Original SVG packaging renders generated from catalog data, generated campaign imagery, reduced-motion support, skip link, native `<dialog>` drawers.
- SEO: metadata, sitemap, robots, Product JSON-LD (only fields that exist).
- **Help desk assistant** (floating "Help" button on every page, English and Turkish): estimates when a demo order would arrive from its order number plus checkout email (business days, weekends skipped, and honest that demo orders never ship), lists the shipping countries with times and rates, answers delivery time and shipping cost per country, recommends products by goal and explains what each supplement is commonly used for, and covers discount codes, payments, returns and stock. Answers come from the store's own data with no health claims; medical questions are redirected to a doctor. Code: `src/server/assistant/`, endpoint `POST /api/assistant` (validated, 12 messages / 600 characters, 20 requests per minute per IP).
  - Optional AI phrasing: set `ASSISTANT_LLM_API_KEY` (plus optionally `ASSISTANT_LLM_BASE_URL` and `ASSISTANT_LLM_MODEL`) to let any OpenAI-compatible model rewrite the answer from the same facts. If it is unset or the call fails, the built-in engine answers. Replies are labelled with their source.
- Policy pages, contact form (demo, nothing sent), 404/error/loading states, demo order confirmation page.

## How demo checkout works

1. The client sends only `variantId` + `quantity`, the address, shipping method and discount code, plus the totals it displayed.
2. `src/server/orders/service.ts` re-prices everything with the same pure `priceCart()` used by the UI. Totals the client sent are never trusted.
3. A mismatch returns `409 price_mismatch`; stock/discount changes return `409 cart_changed`; malformed input `400`.
4. The `PaymentProvider` interface (`src/server/payments`) is the seam for a real provider; the demo provider charges `0`.
5. Orders are stored through an `OrderRepository` (JSON file). A `CarrierAdapter` interface exists as a hook for carriers.

## Ownership

Copyright (c) 2026 Reha Demircan, all rights reserved (see `LICENSE`). Third-party dependencies and fonts keep their own licences. The FORGE name is a placeholder and has not been trademark-cleared; check it before using it publicly.

## Running it 24/7

This repo is a standard Next.js app, so it can be hosted on any Node host or on Vercel. Nothing has been deployed from here.

1. Set `NEXT_PUBLIC_SITE_URL` to the public address.
2. `npm ci && npm run build && npm start` on a Node 20+ host, or import the repo into Vercel.
3. Demo orders are written to a local JSON file, which does not persist on serverless hosts. That is fine for a demo; real orders need a database.

## Before real commerce

This repo is not ready to take money. Still needed: a real payment provider integrated server-side (hosted fields/redirect; never handle raw card data), a database instead of the JSON file, verified tax/VAT and carrier rates, inventory reservation, transactional email, legal review of policies, nutrition/label compliance review for the real products, trademark clearance for the name, rate limiting and bot protection.

## Verified results

Commands actually run on the final code:

- `npx eslint .` — no errors
- `npx tsc --noEmit` — passes
- `npm run build` — succeeds (38 static pages)
- `npx vitest run` — 68/68 pass
- `npx playwright test` — 43/43 pass against the production build (desktop + mobile)

A fresh dev-server load of home, product, cart drawer and checkout showed no console errors or warnings.

## Known limitations / unfinished

- Türkiye district data covers only İstanbul, Ankara, İzmir, Bursa and Antalya; other provinces use a free-text district.
- No database (Prisma/PostgreSQL not implemented).
- Nutrition values, prices, stock, shipping rates and policy text are illustrative placeholders.
- `/order/<unknown-id>` renders the not-found UI but responds with HTTP 200 (streamed).
- Cart drawer and cart page content both live in the DOM.
- Big Shoulders font fallback-metrics warning appears at build time.
- The AI phrasing path was tested only against a local mock server; it has not been run against a real model provider. The built-in assistant is rule-based (keyword intents), not a trained model, so unusual phrasings fall back to a suggestions menu.
- Accessibility was built in (labels, focus handling, contrast tokens) but not audited with an external tool.
- No deployment was made.
