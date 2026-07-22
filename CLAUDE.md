# CLAUDE.md — Unö

Guidance for Claude Code (and humans) working in this repo. Read this first.

## What this is

**Unö** — a mobile-first, **trust-centric** real estate platform for Nigeria
(launching Abuja + Lagos). The wedge is trust: verified titles, transparent
fees, and — from Phase 2 — escrowed money. "Unö" means *house* in Igbo; keep
the umlaut in product copy.

We are in **Phase 1 (Trust MVP)** — no money moves through the app by design.
Build order is one module at a time; see `docs/Uno-Build-Brief.md`.

**Status: Steps 1–3 complete.** Next up: Step 4 (Trust Panel).

## Build order (don't build ahead)

1. ✅ Skeleton — RN + NestJS + Postgres, one listing card end-to-end.
2. ✅ Listings — `listing`/`listing_media`/`fee_line` model (TypeORM migrations,
   PostGIS enabled), create/browse (verified-first)/detail, media upload with
   multi-size WebP/AVIF derivatives + perceptual hash, itemised fee ledger
   required at creation, seed catalogue. Canonical vocabulary enforced
   (see `apps/api/src/listings/listing.enums.ts`).
3. ✅ Landmark search — `gazetteer_entry` (estates/districts/landmarks + aliases
   + PostGIS points), `SearchProvider` adapter with Typesense (prod, locked) and
   pg_trgm (dev/demo) drivers, typo-tolerant autocomplete (`/search/landmarks`),
   radius listing search verified-first (`/search/listings`), listing↔gazetteer
   FK + geocoding. Set `SEARCH_DRIVER=typesense` in prod.
4. ⬜ Trust Panel — verification tiers, title-type risk labeling, badges.
5. ⬜ Fee ledger — itemized charges; Total Cost of Acquisition calculator.
6. ⬜ Chat + WhatsApp.
7. ⬜ Inspection booking.
8. ⬜ Verification + admin panel.

**Explicitly NOT in Phase 1:** escrow, contracts/e-sign, 3D scanning,
multi-currency, valuation model, property management.

## Planned features (noted, NOT yet built — do not build ahead)

- **AI chat concierge** (proposed, post-Phase-1-spine). An assistant that
  answers listing questions, general Nigerian real-estate questions, and
  "evaluate Unö" questions, then hands off to a live agent. Layers on top of
  Step 6 (Chat) or as its own Concierge/Support module, and should answer
  *from* verified listing/trust data. **Guardrails are non-negotiable given the
  trust brand:** no legal advice; never overstate what a verification tier
  guarantees (under-claim, per the tier scope rules); always offer/defer to a
  human for anything binding; cite the source (the listing's own Trust Panel /
  fee ledger) rather than inventing. To be specced properly before any build.

## Layout

```
apps/api      NestJS (TypeScript) monolith — REST under /api/v1
apps/mobile   React Native (Expo) app — Android + iOS
docs          Build brief (companion specs land here too)
scripts       Dev helpers (DB bootstrap, session setup)
```

The two apps are **self-contained** (no npm workspace hoisting) so the React
Native / Metro toolchain stays out of the backend's dependency tree. Install
and run each independently.

## Running locally

```bash
# Database — Docker if available:
docker compose up -d db          # Postgres+PostGIS on :5432 (user/pass/db = uno)
# ...or, in a container without a Docker daemon, a local cluster:
bash scripts/dev-db.sh           # starts Postgres on :5433, creates the uno db

# Backend:
cd apps/api && cp .env.example .env && npm install && npm run start:dev
#   -> http://localhost:3000/api/v1 ; GET /health and GET /listings
#   NOTE: if you used scripts/dev-db.sh, set DATABASE_URL in apps/api/.env to
#   postgresql://postgres@127.0.0.1:5433/uno

# Mobile:
cd apps/mobile && npm install && npm run start
#   On a physical device, localhost = the phone. Point at your LAN IP:
#   EXPO_PUBLIC_API_URL=http://<lan-ip>:3000/api/v1 npm run start
```

A `SessionStart` hook (`.claude/settings.json` → `scripts/session-setup.sh`)
installs both apps' deps automatically when a web session starts.

## Brand (canonical — do not deviate)

The official logo is the **Unö wordmark** with the two umlaut dots over the **ö**
in red. It is locked. It **must** be used on the mobile app and the website —
everywhere the product is branded.

- Assets live in `apps/mobile/assets/brand/` (SVG sources + PNG sizes; see the
  README there). App icon + splash are wired via `app.json`; the in-app header
  uses `apps/mobile/src/components/Logo.tsx`.
- **Never re-typeset "Unö" as plain text** where the logo belongs — render the
  brand asset so the red dots and exact colours are always right.
- Colours are locked: Unö Green `#0B3D2E`, Umlaut Red `#D7263D` (dots only),
  Off-white `#F5F6F5`, Ink `#111111`, White `#FFFFFF`.
- When the website / landing page is built, it uses these same assets and
  colours — no separate logo.
- Keep the umlaut (**Unö**) in all product copy.

## Conventions that are NOT optional (from the brief)

- **Naira, per annum.** Prices are ₦, quoted **per year**, never a US-style
  monthly figure. Store whole naira in `bigint`. Itemize fees; no hidden fees.
- **Landmark-first.** Locate by landmark/estate/area ("Behind Shoprite, Jabi"),
  not street address.
- **Verified-first.** Verified listings surface first; trust sits above the fold.
- **Mobile-first, low-data.** Never ship full-res images to a phone; multi-size
  WebP/AVIF, lazy-load, cache at the edge. Data cost is a real barrier.
- **Light KYC to browse, full KYC to transact.** Don't gate browsing.

## Tech choices made so far

- **ORM: TypeORM** — first-class NestJS integration + native PostGIS spatial
  types (needed for step 3). `synchronize: true` is used **only** in the
  skeleton; replace with real migrations in step 2 before the schema matters.
- External partners (Paystack, WhatsApp BSP, KYC) go **behind adapter
  interfaces** when introduced, so they're swappable without touching business
  logic. Not present yet.

## The security line (critical)

Phase 1 is safe to build with AI assistance — no customer money flows through
it. **Before Phase 2** (escrow, contracts, holding funds): bring in an
experienced engineer and get a security review. Do not cross that line solo.

## Housekeeping

- Never commit `.env` (only `.env.example`). Secrets stay out of git.
- Commit messages: clear and descriptive. Do not include model identifiers.
