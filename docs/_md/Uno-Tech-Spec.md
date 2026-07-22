Unö

Technical Specification

Architecture, data model, adapter boundaries, and cost posture for the locked stack.

Companion to the Build Brief, Strategy Roadmap, Onboarding & Milestones, and Product Feature Spec.

Version 1  ·  July 2026  ·  Confidential

# Guiding principles

- Boring where it counts, modern where it pays. Money, titles, and identity flow through this system. Choose proven, well-understood technology for anything touching those; save the novelty budget for search and, later, the 3D experience.

- One codebase, one backend, small team. No microservices until real scale forces it. A well-structured monolith is faster to build, cheaper to run, and easier for one or two people to hold in their heads.

- Mobile-first, low-data, WhatsApp-native. Every technical choice is filtered through one question: will this work well on an Android phone in Lagos on an expensive data plan?

- Integrate regulated functions, do not become them. Escrow and lending are partnerships, not modules. Becoming a custodian of funds turns Unö into a regulated financial institution — a different company entirely.

- Build for the demo as well as the deployment. Phase 1’s job is partly to be shown — to Julie, and to a prospective technical co-founder. Seed data, a reset script, and a reliable offline-capable demo path are features, not chores.

# Stack at a glance

The stack is locked. This table records what each piece is for, so a new engineer can see the reasoning rather than re-litigate the choice.

| Layer | Choice | Why |
| --- | --- | --- |
| Mobile app | React Native (Expo) | One codebase for Android and iOS. OTA updates. Large Lagos hiring pool. Diaspora needs iOS; Nigeria needs Android. |
| Backend | NestJS (Node / TypeScript) | Shared types with the app. Strong structural conventions, which matter when much of the code is AI-assisted. |
| Database | PostgreSQL + PostGIS | Transactional integrity for verification records. Geospatial for map, radius search, and acquisition-zone overlap. |
| ORM | TypeORM | Native PostGIS support and first-class Nest integration. Migrations from Step 2 onward — synchronize is skeleton-only. |
| Cache / queues | Redis | Caching, background jobs, rate limiting. |
| Search | Typesense | Typo-tolerant landmark autocomplete. Materially cheaper to run than Elasticsearch at this scale. |
| Object storage | Cloudflare R2 | Media and documents. Zero egress fees, which matters when serving image-heavy content. |
| CDN / images | Cloudflare | Edge caching and multi-size WebP/AVIF derivatives. Central to the low-data strategy. |
| Payments | Paystack | Proven Nigerian rails: cards, transfers, USSD. Phase 1 uses it only for verification and inspection fees. |
| Messaging | WhatsApp Business API via a BSP | 360dialog, Twilio, or Termii. Self-serve WhatsApp does not scale; a BSP is required. |
| Identity / KYC | Licensed provider (Smile ID / Dojah) | NIN and BVN verification plus liveness. Regulated identity checks — never build this. |
| Escrow | Licensed third-party partner (Phase 2) | Regulatory. Never hold funds directly. |
| Infra | Managed Postgres (Neon / Supabase) + containers (Railway / Render) | Start simple. Scale the boring parts later, when there is revenue to pay for them. |
| Admin panel | Lightweight internal React app | Verification review, fraud triage, and dispute handling need real internal UI from day one. |

# Architecture overview

A single NestJS backend organised into clear internal modules — not separate services — talking to PostgreSQL/PostGIS, with Redis for caching and background jobs, and every external partner behind an adapter interface so it can be swapped.

### Clients

| Client | Purpose |
| --- | --- |
| React Native app (Android + iOS) | The product. Buyers, renters, agents, and firms. |
| Admin panel (web) | Internal only. Verification review, fraud triage, dispute handling. |

Both talk to one backend over HTTPS/REST.

### NestJS backend — internal modules

| Module | Responsibility | Phase |
| --- | --- | --- |
| Auth & KYC | Identity levels L0–L4, OTP, KYC provider calls. | 1 |
| Listings & Media | Listing CRUD, media upload, derivative generation. | 1 |
| Search | Typesense index sync, landmark autocomplete, filters. | 1 |
| Trust / Verification | Tiers, title-type labelling, verification records. | 1 |
| Fee Ledger | Itemised fee lines, Total Cost of Acquisition. | 1 |
| Inspections | Booking, reminders, certified reports. | 1 |
| Messaging | In-app threads, proxied contact, WhatsApp dispatch. | 1 |
| Fraud detection | pHash matching, duplicate titles, zone overlap, anomalies. | 1 |
| Gazetteer | Estates, districts, landmarks, aliases, boundaries. | 1 |
| Audit log | Append-only record of every admin and verification action. | 1 |
| Admin APIs | Queues, role assignment, tier definitions. | 1 |
| Escrow · Contracts · Milestones | Slots reserved in the architecture. Not built. | 2 |

### Background workers (Redis queue)

Image derivative generation · perceptual-hash fraud scanning · search index sync · WhatsApp and notification dispatch. Nothing that blocks a user request runs inline.

### Data and external services

| Layer | Service | Holds |
| --- | --- | --- |
| Primary store | PostgreSQL + PostGIS | Users, listings, verifications, fees, audit log, geometry. |
| Cache / queue | Redis | Session cache, background job queue, rate-limit counters. |
| Search index | Typesense | Denormalised listing and gazetteer index, synced from Postgres. |
| Object storage | Cloudflare R2 + CDN | Listing media, derivatives, title documents (signed URLs). |
| External partners | Paystack · WhatsApp BSP · KYC provider | Behind adapter interfaces. Escrow joins this row in Phase 2. |

Why a monolith. Every module above could be a service. None of them should be yet. A solo founder with AI assistance and, soon, one experienced engineer cannot operate a distributed system — and the failure modes of premature microservices (partial deploys, cross-service transactions, debugging across network boundaries) are exactly the failures that would be most expensive here. Modules are separated by clear internal boundaries so that if scale ever demands extraction, the seams already exist.

# What the spec forces technically

Most of the architecture is conventional. These five requirements are where the product spec dictates a specific technical answer, and each is worth understanding before writing code.

| 1.  Geospatial — the acquisition-zone check | PostGIS |
| --- | --- |

The product spec requires that a listing be checked against known government acquisition zones before publish. That is a polygon-containment problem, and it is the reason PostGIS is in the stack rather than plain Postgres.

- Store acquisition zones and estate boundaries as polygons; store listings as points, and land parcels as optional polygons.

- On publish, run an intersection check. An overlap flags the listing into the fraud queue — it does not auto-reject, because a human decides.

- The same index serves map clustering, radius search, and draw-your-own-area.

[ASSUMPTION] Acquisition-zone polygon data is obtainable from state lands bureaux, or can be digitised from published maps. This is unverified and it is a real risk to the feature — worth asking the anchor firm what data actually exists and in what form. If polygons are unavailable at launch, the check degrades to "not checked" on the Trust Panel rather than silently passing.

| 2.  Fraud detection — stolen photos and duplicate titles | Background workers |
| --- | --- |

Listings arrive by direct submission rather than from a vetted MLS, so the platform has to screen them. Three checks, all running as background jobs so they never block an upload:

- Perceptual hashing (pHash). On image upload, compute a hash and compare against the existing corpus. Stolen listing photos are rampant, and a near-match against another listing is a strong fraud signal.

- Duplicate title numbers. On publish, cross-reference the title number against every other listing. Multiple sale is the single most common Nigerian fraud pattern and this check catches its digital footprint.

- Pricing anomalies. Flag listings far outside the range for their area. Crude, but effective against bait listings.

Flag, never auto-reject. Every anomaly routes to the admin review queue with the reason attached. A machine can flag, queue, rank, and pre-fill. A human decides. This is a product rule with a technical consequence: the fraud engine writes to a queue table, it does not mutate listing status directly.

| 3.  Low-data mode — an infrastructure problem, not an app problem | Cloudflare + R2 |
| --- | --- |

Data cost suppresses usage in Nigeria, and an image-heavy property app is close to the worst case. Most of the solution sits in the pipeline rather than the client:

- Generate multi-size WebP/AVIF derivatives on upload. Never serve a full-resolution photo to a phone.

- Lazy-load galleries: first image eagerly, the rest on demand.

- Cache aggressively at the Cloudflare edge; R2’s zero egress fees make this cheap to sustain.

- Local SQLite cache in the app so saved listings open offline — which also makes the demo resilient to bad conference-room wifi.

- An explicit low-data toggle that suppresses gallery prefetch and map tiles.

| 4.  Verification records are legal artifacts | Append-only audit log |
| --- | --- |

A registry check performed by a named solicitor, with a scope statement and a date, may need to be reconstructed years later in a dispute. That is not ordinary application data. It requires an append-only audit table — insert-only, no updates, no deletes — recording who did what, when, and why.

- Every admin action writes an audit row: actor, action, target, timestamp, reason given.

- Verification outcomes are versioned rather than overwritten. A re-check creates a new record; the old one remains.

- Enforce insert-only at the database level (revoke UPDATE and DELETE on the table), not merely in application code.

This is the Phase 1 foundation for the Phase 2 contract requirement — hash the contract PDF, store hash and signer identities in the same append-only log. No blockchain is required; a write-once audit trail with good backups does the job at a fraction of the complexity, and is far easier to explain to a court.

| 5.  Search must match how Nigerians think | Typesense + gazetteer |
| --- | --- |

There is no reliable street addressing to geocode against, so search runs on a hand-curated gazetteer of estates, districts, and landmarks. Typesense provides typo tolerance — "Gwarimpa" and "Gwarinpa" must both work — and the index is synced from Postgres by a background worker rather than written to directly, so Postgres stays the single source of truth.

The gazetteer is the dependency to watch. It is manual work, not a data purchase, and search quality is capped by its coverage. A few hundred entries across Abuja and Lagos is the realistic launch bar, and the work should start before it blocks Build Step 3.

# Adapter boundaries for external partners

Payments, WhatsApp, KYC, and later escrow each sit behind an interface. The Nigerian fintech landscape moves quickly; a partner change should be an adapter swap, not a rewrite. Each interface is defined by what the product needs, not by what the vendor’s SDK happens to expose.

| Adapter | Interface the product needs | Launch implementation | Swap risk |
| --- | --- | --- | --- |
| PaymentProvider | Initiate a charge, verify a transaction, handle webhook confirmation, issue refunds. | Paystack | Low — Flutterwave is a near drop-in if needed. |
| MessagingProvider | Send a templated message to a phone number, receive delivery status, handle inbound replies. | WhatsApp BSP (360dialog / Twilio / Termii) | Medium — template approval differs by BSP. |
| IdentityProvider | Verify NIN or BVN, run a liveness check, return a pass/fail with a reference. | Smile ID or Dojah | Medium — the diaspora passport path may differ materially. |
| StorageProvider | Store an object, produce sized derivatives, return a signed URL. | Cloudflare R2 | Low — S3-compatible API. |
| EscrowProvider (Phase 2) | Open an escrow account, confirm funding, release against a milestone trigger, handle disputes. | Not selected. Licensed partner only. | High — do not design this until the partner is chosen. |

A note on the escrow adapter. It is listed here so the seam exists in the architecture from day one, and so a co-founder can see where it plugs in. It is not to be implemented in Phase 1, and the interface above should be treated as a sketch — the real shape will be dictated by whichever licensed partner is selected, and by their regulatory requirements rather than by product preference.

# Data model sketch

Phase 1 tables only, with the Phase 2 shape anticipated where it affects Phase 1 decisions. This is a sketch for orientation, not a migration script.

### Core entities

| Table | Key fields | Notes |
| --- | --- | --- |
| user | id, phone, email, display_name, identity_level (L0–L4), kyc_reference, created_at | identity_level drives every gate in the product. KYC reference points at the provider record, never at raw document data. |
| firm | id, name, cac_number, credentials, verification_status, branded_profile | Firms are first-class. Nigeria is firm-centric and the anchor partnership depends on this. |
| agent_profile | user_id, firm_id, esvarbon_niesv, years_active, indemnity_recorded, tier, approved_by, approved_at | Separate from user so an individual can hold a professional profile without conflating identity with credentials. |
| listing | id, type, status, agent_id, firm_id, gazetteer_id, geom (point), parcel (polygon, nullable), price_naira (bigint), quote_basis, upfront_years, title_type, verification_tier | Price is bigint whole naira. Never floats, never kobo. |
| listing_media | id, listing_id, ordinal, r2_key, derivatives, phash, capture_date | phash drives the stolen-photo check. |
| fee_line | id, listing_id, kind, amount_naira, is_percentage, refundable, disclosed_at | Required at listing creation. The Total Cost of Acquisition is computed from these rows, not stored as a single number. |
| gazetteer_entry | id, name, aliases, kind (estate/district/landmark), city, geom, boundary (polygon, nullable) | Hand-curated. Aliases carry the common misspellings. |
| acquisition_zone | id, name, authority, boundary (polygon), source, recorded_at | Source and date recorded because the data provenance is itself contestable. |
| verification | id, listing_id, tier_granted, verifying_firm_id, solicitor_name, scope_statement, checked_at, outcome, acquisition_result | Versioned, never overwritten. A re-check creates a new row. |
| inspection | id, listing_id, buyer_id, agent_id, scheduled_for, kind (self/certified), status, surveyor_id, report_key | Certified inspections produce the Inspection-Certified badge. |
| thread / message | thread: id, listing_id, buyer_id, agent_id, fee_schedule_snapshot · message: id, thread_id, sender_id, body, sent_at | The fee schedule is snapshotted onto the thread so the disclosure is part of the conversation record. |
| fraud_flag | id, listing_id, kind, evidence, status, resolved_by, resolved_at | Written by workers, worked by humans. |
| audit_log | id, actor_id, action, target_type, target_id, reason, created_at | Append-only. UPDATE and DELETE revoked at the database level. |

### Decisions worth flagging

- Price as bigint whole naira. Floating-point money is a classic defect and naira transactions are large enough that precision errors would be visible. Kobo is not used in property pricing.

- Fee lines as rows, not a JSON blob. The ledger must be queryable, comparable across listings, and — from Phase 2 — lockable at offer acceptance. Rows make all three straightforward.

- Verification versioned rather than mutated. A check is a snapshot with a date. Overwriting it would destroy the very record the product sells.

- No raw KYC documents stored. Store the provider’s reference and outcome. Holding NIN or BVN document images creates NDPR exposure with no product benefit.

# Build sequence

Aligned to the Build Brief. Each step is a natural stopping point — working and verified before the next begins.

| Step | Module | What must work before moving on | Phase |
| --- | --- | --- | --- |
| 1 | Skeleton | App talks to backend, backend talks to database, one hardcoded listing card renders on a real phone. Done and verified. | 1 |
| 2 | Listings | Create, browse, detail. Media upload with derivative generation. Real migrations replace synchronize here. | 1 |
| 3 | Landmark search | Typesense index synced from Postgres. Gazetteer seeded. Typo-tolerant autocomplete returning sensible results. | 1 |
| 4 | Trust Panel | Verification tiers, title-type risk labelling, badges on cards and detail pages. Above the fold. | 1 |
| 5 | Fee ledger | Itemised fee lines required at listing creation; Total Cost of Acquisition computed and displayed. | 1 |
| 6 | Chat + WhatsApp | In-app threads with proxied contact details. WhatsApp BSP delivering notifications. | 1 |
| 7 | Inspection booking | Scheduling, reminders, attendance confirmation. Paystack for paid certified reports. | 1 |
| 8 | Verification + admin | Agent KYC flow, document upload, internal review queues, append-only audit log, 2FA on internal accounts. | 1 |
| — | Security line | Experienced engineer on the team and a completed security review. Non-negotiable gate. | → |
| 9+ | Transaction rail | Escrow adapter, contract generation and e-sign, milestone engine, dispute tooling, 3D capture. | 2 |

The migration note matters. TypeORM’s synchronize is convenient for a skeleton and dangerous thereafter — it will silently drop columns. Move to real migrations at Step 2, before any schema exists that would hurt to lose.

# Security posture

Phase 1 moves no customer money, which is what makes AI-assisted development acceptable. That is a deliberate boundary, not an accident, and it should be stated plainly to anyone evaluating the codebase.

### In Phase 1, from day one

- Two-factor authentication on every internal account. No exceptions, no "we will add it later."

- Least privilege by role: support cannot approve verifications; reviewers cannot assign roles.

- Append-only audit log with UPDATE and DELETE revoked at the database level.

- No raw KYC documents at rest. Provider references only.

- Signed URLs with short expiry for document access. Title documents are not public objects.

- NDPR considerations designed in — data minimisation, retention limits, and a deletion path — rather than retrofitted under pressure.

- Rate limiting on contact, enquiry, and listing-creation endpoints. These are the abuse surfaces.

### Before Phase 2 — the security line

An experienced engineer on the team and a completed security review. Both, before anything touches customer money.

The gap between "working app" and "app I would trust with a ₦40M land purchase" is security, edge cases, and operational maturity. Escrow integration, contract generation, and funds-adjacent state machines are where a subtle defect becomes someone’s life savings. This line is not a formality and it should not be crossed solo, however well Phase 1 has gone.

# Cost posture for a lean launch

Phase 1 is designed to run cheaply while inventory is deliberately small. The pattern to note is that the meaningful costs are per-usage — they arrive alongside revenue rather than ahead of it.

| Cost line | Phase 1 posture | Scales with |
| --- | --- | --- |
| Managed Postgres | Free or entry tier (Neon / Supabase) is sufficient for a pilot catalogue. | Data volume and connection count |
| Container hosting | Entry tier (Railway / Render). One API container plus one worker. | Traffic |
| Cloudflare R2 + CDN | Generous free tier; zero egress is the reason this is cheap at image scale. | Storage volume |
| Typesense | Small cloud tier, or self-hosted alongside the API to start. | Index size |
| Redis | Entry tier or bundled with the host. | Job volume |
| WhatsApp BSP | Per-conversation pricing. The first real per-usage cost. | Active users and notification volume |
| KYC provider | Per-check fee. Only incurred at L2 and L4 escalation. | Verified users |
| Paystack | Per-transaction percentage. Only on paid verifications and inspections. | Revenue |
| Verification (human) | Solicitor and surveyor time. The dominant real cost, and the one that is not software. | Verifications performed |

The honest observation: infrastructure is not the constraint. A Phase 1 pilot with fifty to a hundred verified listings can run on entry tiers across the board for a modest monthly figure. The real cost of this business is human verification capacity — solicitor and surveyor time — which is precisely why the unit economics question for the anchor firm matters more than any hosting decision in this document.

# Working with AI assistance

Phase 1 is built with AI assistance by a non-technical founder. That is workable within limits, and the limits are worth stating explicitly for the benefit of whoever inherits this codebase.

- Brief against the real docs. Point the tooling at this spec, the Product Feature Spec, and the Onboarding & Milestones flow, so it builds against the actual design rather than a generic property-app template.

- One module at a time, verified before moving on. The build order exists to prevent a half-finished spine with eight half-finished features hanging off it.

- Prove it runs. Hit the endpoints, render the screen, show the result. Asserting that something works is not the same as demonstrating it.

- Commit after each working step. Clear messages. The commit history is the only record of how the system was assembled.

- Integrate partners at the moment of need. Paystack, WhatsApp, KYC, and Cloudflare each require a real signup and real credentials. Do them when the module needs them, not in advance.

What this produces is a working, demonstrable Trust MVP — and an honest starting point for an experienced engineer, who should expect to review rather than inherit blindly. Phase 1’s job is to prove the model and recruit that person, not to be the final architecture.

## Changelog

v1 — Locked-stack rationale, monolith architecture, five spec-forced technical requirements, adapter interface boundaries, Phase 1 data model sketch, build sequence with the security line, security posture, and lean-launch cost posture.