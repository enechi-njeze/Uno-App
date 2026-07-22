# Unö

A mobile-first, **trust-centric** real estate platform for Nigeria (launching Abuja + Lagos).
The wedge is trust: verified titles, transparent fees, and — from Phase 2 — escrowed money.
"Unö" means *house* in Igbo.

> **Status: Phase 1 (Trust MVP) — Step 1 of 8: skeleton.**
> The spine is up end-to-end (React Native app → NestJS API → Postgres), rendering one
> real listing card read from the database. No money moves through Phase 1 by design.

---

## Monorepo layout

```
uno-app/
├── apps/
│   ├── api/            NestJS (TypeScript) monolith  → REST at /api/v1
│   │   └── src/
│   │       ├── health/     GET /health  (liveness + DB reachability)
│   │       └── listings/   GET /listings, GET /listings/:id  (TypeORM + Postgres)
│   └── mobile/         React Native (Expo) app — Android + iOS
│       └── src/         api client · ListingCard · HomeScreen
├── docs/               Build brief (+ companion specs to be added)
├── docker-compose.yml  Local Postgres + PostGIS
└── package.json        Convenience scripts (see below)
```

The two apps are intentionally **self-contained** (no workspace hoisting) — it keeps the
React Native / Metro toolchain out of the backend's dependency tree.

## Tech stack (locked for Phase 1)

| Concern   | Choice                                             |
|-----------|----------------------------------------------------|
| App       | React Native (Expo)                                |
| Backend   | NestJS (Node/TypeScript), single monolith          |
| Database  | PostgreSQL + PostGIS (geospatial arrives in step 3)|
| ORM       | TypeORM                                             |

Later phases add Redis, Typesense (landmark search), Cloudflare R2/CDN, Paystack,
WhatsApp Business API, and KYC — each behind an adapter interface.

---

## Running it locally

Prerequisites: **Node 22**, and either **Docker** (for the DB) or a local Postgres.

### 1. Database

```bash
docker compose up -d db          # starts Postgres+PostGIS on localhost:5432 (user/pass/db = uno)
```

No Docker? Point `apps/api/.env` `DATABASE_URL` at any Postgres 14+ instance.

### 2. Backend

```bash
cd apps/api
cp .env.example .env             # default DATABASE_URL matches the docker compose db
npm install
npm run start:dev                # http://localhost:3000/api/v1
```

On first boot the API auto-creates the `listings` table and seeds **one** listing.

Smoke-test it:

```bash
curl http://localhost:3000/api/v1/health     # {"status":"ok","db":"up",...}
curl http://localhost:3000/api/v1/listings   # [{ "title": "3-Bedroom Serviced Apartment", ... }]
```

### 3. Mobile app

```bash
cd apps/mobile
npm install
npm run start                    # Expo dev server; press a for Android, i for iOS, or scan in Expo Go
```

**On a physical device**, `localhost` means the phone, not your laptop — so point the app
at your machine's LAN IP:

```bash
EXPO_PUBLIC_API_URL=http://<your-lan-ip>:3000/api/v1 npm run start
```

The home screen shows a live `API + DB connected` status dot and the seeded card.

### Convenience scripts (from repo root)

```bash
npm run db:up          # docker compose up -d db
npm run api            # start the backend in watch mode
npm run mobile         # start the Expo dev server
npm run install:all    # install both apps
```

---

## What "done" means for Step 1

- [x] RN app + NestJS backend + Postgres, three separate processes wired together
- [x] `GET /health` proves API ↔ DB connectivity
- [x] One listing **seeded into Postgres** and served over REST (not hardcoded in the client)
- [x] Mobile app fetches and renders that listing as a card, with a live connection indicator
- [x] The card already speaks Unö: ₦ price **per annum**, **landmark-first** location,
      a **verified** trust badge, and the **title type** (C of O)

Next up — **Step 2: Listings** (full data model, create/browse/detail, media upload with
image compression). See `docs/Uno-Build-Brief.md` for the full build order.
