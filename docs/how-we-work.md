# How we build Unö with Claude

*Paste this as the first message in any new Unö build session — or just point
Claude at this file. It's the operating manual for how founder + Claude work
together on this project.*

---

## What this is (plain language)

Unö is a trust-first real estate app for Nigeria — verified property titles,
transparent fees, and (later) escrowed money, so people stop losing money to
property fraud. We're building it one piece at a time. The founder is
non-technical: explain decisions in plain terms, say what (if anything) you need
from them, and don't assume they'll run commands unless you walk them through it.

## The one rule that keeps this effortless

**Always run these sessions on the `uno-app` repo** (not the profile repo). A
Claude session can only save to the repo it's opened with. Opened on `uno-app`,
Claude saves every change to GitHub automatically — no bundles, no links, no
commands from the founder.

If you ever find you can **read** `uno-app` but can't **push** to it, **stop and
say so** — it means the session was sourced from the wrong repo. Do not work
around it with bundles or by pushing to another repo.

## How to work

- Build in the order in `docs/Uno-Build-Brief.md`, **one module at a time**.
  Finish and verify each before starting the next. Don't build ahead.
- **Prove things work** (run it, hit the endpoints, show output) — don't just
  assert success.
- **Commit and push after each working step**, with clear messages.
- Surface only the few decisions that are genuinely the founder's; pick sensible
  defaults for the rest and say what you chose.
- When a real external integration is needed (Paystack, WhatsApp, KYC,
  Cloudflare), walk the founder through **that one signup at the moment it's
  needed** — not before.

## Technical context (for the model)

- **Stack is locked:** React Native (Expo) app; NestJS monolith (TypeScript);
  PostgreSQL + PostGIS; later Redis, Typesense, Cloudflare R2/CDN, Paystack,
  WhatsApp BSP, KYC provider.
- **Monorepo, two self-contained apps** (`apps/api`, `apps/mobile`) — **no**
  npm workspace hoisting (keeps the RN/Metro toolchain out of the backend deps).
  Install and run each independently.
- **ORM is TypeORM** (native PostGIS + first-class NestJS integration).
  `synchronize: true` is **skeleton-only**; move to real migrations in Step 2
  before the schema matters.
- **External partners go behind swappable adapter interfaces.**
- **Non-negotiable conventions:** naira, quoted **per annum** (`bigint`, whole
  naira); **landmark-first** search; **verified listings surface first**;
  mobile-first / low-data (multi-size WebP/AVIF, never full-res to a phone);
  light KYC to browse, full KYC to transact.
- **The security line:** Phase 1 moves no customer money — fine to build with AI
  assistance. **Before Phase 2** (escrow / contracts / holding funds), bring in
  an experienced engineer and a security review. Do not cross that line solo.
- The repo has `CLAUDE.md`, a `SessionStart` hook (installs deps), and
  `scripts/dev-db.sh` (starts Postgres without Docker). Read `CLAUDE.md` on boot.

## Where the build is (update as it moves)

- ✅ **Step 1 — Skeleton:** RN + NestJS + Postgres, one listing card end-to-end.
- ⬜ **Step 2 — Listings** (next): data model, create/browse/detail, media upload
  with image compression.
- Steps 3–8: landmark search, Trust Panel, fee ledger, chat + WhatsApp,
  inspection booking, verification + admin. See `docs/Uno-Build-Brief.md`.

If `uno-app` is still empty when a session starts, ask to **rebuild Step 1 and
push it**, then continue to Step 2.
