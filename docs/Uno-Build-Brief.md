# Unö — Build Brief for Claude Code

*Read this first. It orients you on the project, then points to the detailed specs.*
*Drop the four companion docs in `/docs`: strategy roadmap, onboarding & milestones, product feature spec, tech spec.*

---

## What Unö is

A mobile-first, trust-centric real estate platform for Nigeria (launching Abuja + Lagos). The market loses ~$4B/year to property fraud, ~70% of it tied to title problems, and only ~3% of Nigerians hold a valid land title. Every existing platform is an unverified listings noticeboard. Unö's wedge is **trust**: verified titles, escrowed money, transparent fees. Discovery features (search, 3D tours, chat) ride on top of that trust layer — they don't replace it.

"Unö" means "house" in Igbo. Spelled with the umlaut everywhere.

**The core mental model:** don't police the conversation, own the settlement. Money, contract, and title move together through gated milestones. Leaving the platform means losing all three protections.

---

## What we are building NOW — Phase 1 only

Phase 1 is the **Trust MVP**. No money moves through it yet. That's deliberate — escrow and contracts raise the security bar sharply and come in Phase 2 with an experienced engineer and a security review.

**Phase 1 scope:**
- Listings + media (create, browse, detail page)
- Landmark/estate/area-based search (not address-based)
- The **Trust Panel** — verification tier badge, title type with risk labeling, registry check status, agent track record
- **Transparent fee ledger** — every charge itemized, no hidden fees enforced
- In-app chat + WhatsApp integration
- Inspection appointment booking
- Agent + listing verification flow
- Admin review panel (for verification/fraud triage)

**Explicitly NOT in Phase 1:** escrow, contracts/e-sign, 3D scanning, multi-currency, valuation model, property management. Do not build these yet.

---

## Stack (locked)

- **App:** React Native (Expo) — Android + iOS from one codebase
- **Backend:** NestJS (Node/TypeScript) — single well-structured monolith, NOT microservices
- **Database:** PostgreSQL + PostGIS (geospatial for map + search)
- **Cache/queue:** Redis
- **Search:** Typesense (typo-tolerant landmark autocomplete)
- **Storage/CDN:** Cloudflare R2 + Cloudflare edge, multi-size WebP/AVIF
- **Payments:** Paystack (Phase 1 only needs this for verification fees)
- **WhatsApp:** Business API via a BSP (360dialog / Twilio / Termii)
- **KYC:** licensed provider (Smile ID / Dojah) for NIN/BVN
- **Infra:** managed Postgres (Neon/Supabase) + containers (Railway/Render)

External partners (payments, WhatsApp, KYC) sit behind **adapter interfaces** so they can be swapped without touching business logic.

---

## Build order (one module at a time — don't build everything at once)

1. **Skeleton first.** Project structure: RN app + NestJS backend + Postgres. Get "hello world" running end to end — app talks to backend, backend talks to database. Render one hardcoded listing card on screen. Prove the spine before adding features.
2. **Listings** — data model, create/browse/detail, media upload with image compression.
3. **Landmark search** — Typesense index synced from Postgres; gazetteer of estates/districts/landmarks; typo-tolerant autocomplete.
4. **Trust Panel** — verification tiers, title-type risk labeling, badges on listings.
5. **Fee ledger** — itemized charges on each listing; the Total Cost of Acquisition calculator.
6. **Chat + WhatsApp** — in-app messaging, proxied contact details, WhatsApp Business API for notifications.
7. **Inspection booking** — scheduling, reminders, calendar sync.
8. **Verification + admin panel** — agent KYC flow, listing title-doc upload, internal review queue.

Each numbered item is a natural stopping point. Get it working before moving on.

---

## Non-negotiable design rules

- **Mobile-first, low-data.** Never ship full-res images to a phone. Serve WebP/AVIF at multiple sizes, lazy-load galleries, cache hard at the edge, cache saved listings offline (local SQLite). Data cost is a real barrier in Nigeria.
- **Naira formatting (₦).** Rent quoted **per annum**, 1–2 years upfront, with agency/caution/legal/service fees itemized. Never a US-style monthly headline figure.
- **Search is landmark-first**, address-second. "Behind Shoprite Jabi," not a street address.
- **Verified-first everywhere.** Verified listings surface first; the Trust Panel sits above the fold where Zillow puts its valuation.
- **Light KYC to browse, full KYC to transact.** Don't gate browsing; do gate action.

---

## The security line (critical)

Use AI assistance freely for all of Phase 1 — no customer money moves through it, so the risk is contained. **Before Phase 2** (escrow, contracts, holding funds): bring in an experienced engineer and get a security review. The gap between "working app" and "app I'd trust with a ₦40M land purchase" is security, edge cases, and operational maturity. Don't cross that line solo.

---

## Why we're building this (context that should inform judgment calls)

This is a legacy project — reviving a late father's estate-management firm, digitally, with the hope of eventually partnering with established Nigerian firms (J.U. Uzor & Associates is the anchor). The Phase 1 prototype's job is twofold: prove the verified-listing model works, and be a compelling enough working demo to recruit a technical co-founder and win partner firms. Build it to be *shown*, not just to run.

---

## The four companion docs (in /docs)

1. **Strategy roadmap** — market analysis, business model, phasing, partnership play.
2. **Onboarding & milestones** — role-based onboarding + the 9-stage transaction flow (Phase 2+ for most stages, but read it to understand where Phase 1 fits).
3. **Product feature spec** — every module mapped from Zillow to Nigerian conditions.
4. **Tech spec** — full architecture, the "what the spec forces technically" section, cost posture.

When in doubt about *what* to build, check the product feature spec. About *how*, check the tech spec. About *why*, check the strategy roadmap.
