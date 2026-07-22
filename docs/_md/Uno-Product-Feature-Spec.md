Unö

Product Feature Spec

Every module, mapped from the Zillow model to Nigerian conditions — with user stories, key screens, and data shown.

Companion to the Build Brief, Strategy Roadmap, Onboarding & Milestones, and Tech Spec.

Version 1  ·  July 2026  ·  Confidential

# How to read this document

Zillow’s module structure is sound and worth cloning structurally. But Zillow is a discovery product sitting on infrastructure Nigeria does not have — MLS feeds, standardised addresses, decades of recorded sales, clean titles. Unö is a trust and settlement product that happens to have good discovery.

So every module gets one of four treatments:

| Treatment | Meaning |
| --- | --- |
| Clone | Works as-is. Adapt cosmetics only — currency, terminology, units. |
| Rebuild | Right idea, wrong mechanism for Nigeria. Needs a different data source. |
| Replace | The Nigerian equivalent problem is different enough to warrant a new module. |
| Add | No Zillow equivalent. Exists because Nigerian conditions demand it. |

Each module below carries a build-step tag matching the order in the Build Brief. Modules 1–8 are Phase 1 and are what you are building now. Later-phase features are listed inside each module under "Later phases" so the data model can anticipate them — but they are not built yet.

Identity levels (L0–L4) and verification tiers referenced throughout are defined in the Onboarding & Milestones doc. This spec uses that vocabulary without redefining it.

# Non-negotiable conventions

These apply to every module. They are not per-screen decisions.

| Convention | Rule |
| --- | --- |
| Currency | Naira (₦) everywhere. Stored as bigint whole naira — never floats, never kobo. |
| Rent quoting | Per annum as the headline. Upfront years stated. Monthly equivalent shown only as a secondary convenience figure. |
| Search | Landmark, estate, and area first. Address search exists but is secondary. |
| Ordering | Verified listings surface first, always. Ranking is never sold. |
| Images | Multi-size WebP/AVIF. Never ship full-resolution to a phone. Lazy-load galleries. |
| Identity | Light KYC to browse. Full KYC to transact. Escalate at the moment of need, never at signup. |
| Measurements | Room sizes in ft × ft and sqm simultaneously. Land in plots and sqm. |
| Notifications | WhatsApp is the default channel, not a fallback. |

| 1.  Listings & Media | BUILD STEP 2  ·  PHASE 1 |
| --- | --- |

The foundation. Everything else attaches to a listing record.

### User stories

- As a buyer, I want to see what a property actually costs in total, so I am not ambushed by fees after I have emotionally committed.

- As a renter, I want to know how many years upfront are demanded before I contact anyone.

- As an agent, I want creating a listing to teach me what Unö expects, so my listing is not rejected.

- As a diaspora buyer, I want enough photographic evidence that I can believe the property exists.

### Listing types

Rebuild — Zillow toggles for-sale / for-rent / sold. Unö toggles: Buy · Rent · Short-let · Land · Off-plan. Land and off-plan are enormous in Nigeria and are not first-class Zillow categories. Short-let is a booming Lagos and Abuja segment. The intent selector sets how prices are quoted and which fees appear in the ledger downstream.

### Key screens

| Screen | What it does | Data shown |
| --- | --- | --- |
| Result card | The unit of browsing. Must communicate trust before the tap. | Hero image, verification tier badge, title type, price (₦, per annum if rent), beds/baths or plot size, area/estate name, agent or firm name, save heart. |
| Listing detail | The richest surface. Trust Panel above the fold. | Trust Panel, Total Cost of Acquisition ledger, photo gallery, core stats, description, Nigerian risk panel, distance-to-landmarks, agent card, report-listing link. |
| Photo gallery | Evidence, not decoration. | Lazy-loaded WebP/AVIF carousel, photo count, capture date where available, low-data toggle. |
| Create listing (agent) | Doubles as training in Unö’s standard. | Type, location via gazetteer, price and fee breakdown as required fields, title type (required), document upload, photos, amenities. |

### Data model — what a listing carries

- Identity: type (buy/rent/short-let/land/off-plan), status, created/updated timestamps, owning agent and firm.

- Location: gazetteer entry (estate/district/landmark), city, PostGIS point, optional parcel polygon for land.

- Money: price in whole naira (bigint), quote basis (per annum for rent), upfront years required, and the itemised fee set.

- Physical: beds, baths, internal area (sqm), plot size (sqm and plots), year built, condition.

- Trust: title type, verification tier, verifying firm and solicitor, check date, scope statement, acquisition-zone result.

- Media: ordered image set with multi-size derivatives and perceptual hashes.

### Later phases

3D tour and interactive floor plan (Phase 2). Premium listing tier — where premium means provable, not prettier: 3D scan + verified title + escrow-enabled. Price history once transaction data exists.

| 2.  Landmark Search & Discovery | BUILD STEP 3  ·  PHASE 1 |
| --- | --- |

### User stories

- As a buyer, I want to search the way I actually think — "Gwarinpa", "behind Shoprite Jabi" — not by an address I do not have.

- As a buyer, I want to filter to only verified properties, because that is the whole reason I am here.

- As a buyer of land, I want to know if a parcel sits inside a government acquisition zone before I fall in love with it.

### The search input

Rebuild — Zillow starts from address or ZIP. Nigeria has no reliable street addressing or postcode culture. Unö’s autocomplete is built from a curated gazetteer of estates, districts, and known landmarks — not a geocoding API. Typo-tolerant, because "Gwarimpa" and "Gwarinpa" must both work. Address search exists but is secondary.

### Filters

Add — Trust filters are the most important filter row on the page, and the search defaults to verified-first: Registry-Verified only · Document-Verified and above · Inspection-Certified · Verified agents only. This is the filter that defines the product.

Clone — Standard filters: price range, beds/baths, property type, plot size, with an expanded "more filters" panel and a sort control.

Replace — Zillow’s "sold" filter runs on public sales records, which Nigeria does not have. Substitute a "Recently transacted on Unö" filter, which only becomes meaningful as your own transaction history accumulates. Long-game data moat — Phase 3, not now.

### Map layers

Add — Zillow layers schools and climate risk. Unö layers what Nigerians actually ask about: flood risk, power/grid reliability, water access, security, road condition in rainy season, and government acquisition zones. That last one is critical — land inside an acquisition zone is a common and expensive fraud trap.

### Key screens

| Screen | What it does | Data shown |
| --- | --- | --- |
| Search entry | The first thing a user sees. No signup wall. | Intent selector (Buy/Rent/Short-let/Land/Off-plan), landmark autocomplete, city fallback picker. |
| Results list | Verified-first, always. | Trust filter row, result cards, result count, sort control, low-data toggle. |
| Map view | Split or toggled with list on mobile. | Clustered price pins, estate boundaries, layer toggles, draw-your-own-area tool. |
| Saved search | Retention mechanic. | Saved criteria, alert frequency, channel preference (WhatsApp default). Requires L1. |

[ASSUMPTION] The gazetteer is hand-curated for launch — roughly the major estates, districts, and landmarks of Abuja and Lagos. This is manual work, not a data purchase, and it should start now because it gates search quality. Estimate a few hundred entries to launch credibly.

| 3.  The Trust Panel | BUILD STEP 4  ·  PHASE 1 |
| --- | --- |

This module is the product. Everything else is table stakes.

It sits above the fold on every listing detail page — exactly where Zillow puts the Zestimate. That placement is deliberate and should not be negotiated away for any other content.

### User stories

- As a buyer, I want to know what has actually been checked on this property, and by whom, and when.

- As a buyer, I want to understand what my title type means without already being a lawyer.

- As a buyer, I want to know what the verification does NOT cover, so I am not falsely reassured.

- As an honest agent, I want my verified status visible so I stop competing on equal footing with fraudsters.

### Data shown

| Element | What it displays | Why it matters |
| --- | --- | --- |
| Verification tier badge | Listed / Document-Verified / Registry-Verified / Inspection-Certified, with tier-appropriate colour and icon. | The single most important signal on the page. |
| Title type + risk label | C of O · Governor’s Consent · Deed of Assignment · Letter of Allocation, each with a plain-language risk explainer. | Most buyers do not know a Letter of Allocation is materially weaker than a C of O. Teaching this inline is the highest-leverage trust marketing Unö has. |
| Registry check status | Checked / not checked, the date, and the verifying firm and named solicitor. | A check is a snapshot. The date is part of the truth. |
| Scope statement | Explicitly what was and was not checked, in the firm’s own words. | This is the company’s liability shield. Under-claim deliberately. |
| Acquisition-zone result | Clear / overlap detected / not checked. | Prevents the single most expensive land fraud in Nigeria. |
| Agent trust record | Agent tier, firm affiliation, verified listing count, completed inspections, dispute history. | Verified track record beats self-reported volume. |
| Escrow availability | Escrow-enabled or not. | Phase 2 — but the slot exists in the design from day one. |

Design discipline: a tier that quietly implies more than it checked is the fastest route to the existential risk in the Strategy Roadmap. Every tier states its limits in the product, in plain language, where the buyer sees it — not buried in terms.

| 4.  Fee Ledger & Total Cost of Acquisition | BUILD STEP 5  ·  PHASE 1 |
| --- | --- |

Arguably the single most useful module on the page for a Nigerian buyer or renter, and the one incumbents have no incentive to build.

### User stories

- As a renter, I want to know the real cash I need on day one — not a monthly figure that misrepresents everything.

- As a buyer, I want every fee itemised before I contact anyone, so no charge appears later as a surprise.

- As an agent, I want my fees on the record so I am not undercut by someone quoting a fake headline price.

### Rebuild — the payment estimator

Zillow breaks down principal, interest, taxes, with adjustable down payment and credit score. Nigerian mortgage penetration is single-digit. Unö replaces this with a Total Cost of Acquisition calculator — the number buyers actually get blindsided by:

Purchase price + agency commission + legal fee + survey fee + stamp duty + Governor’s Consent + registration + platform fee = true landed cost

### Rebuild — rental economics

Nigeria quotes rent per annum, often demanding one to two years upfront, plus agency fee, caution fee, legal/agreement fee, and service charge. The rental ledger must show annual rent, upfront years required, and every ancillary fee itemised. A monthly equivalent may appear as a convenience figure. Never as the headline — a US-style monthly figure misrepresents the real cash requirement and would be actively dishonest in this market.

### Data shown

| Fee line | Applies to | Notes |
| --- | --- | --- |
| Agency commission | Buy, Rent | Percentage or flat. Disclosed by the agent at listing creation as a required field. |
| Caution / security deposit | Rent, Short-let | Refundable status stated explicitly. |
| Legal / agreement fee | Buy, Rent | Common source of dispute when undisclosed. |
| Service charge | Rent, estates | Annual. Estate-level where known. |
| Survey fee | Buy, Land | Where a survey is required or recommended. |
| Stamp duty | Buy, Land | Statutory. |
| Governor’s Consent | Buy, Land | Statutory. Flag that this is the step that takes months. |
| Registration | Buy, Land | Statutory. |
| Unö platform fee | All | Stated plainly alongside everyone else’s. Transparency applies to us too. |

Enforced in the product, not by policy. Fee fields are required at listing creation. A charge that was never on the ledger is, from Phase 2, a dispute trigger — and the ledger locks at offer acceptance (Stage 5 of the milestone flow).

| 5.  Chat & WhatsApp | BUILD STEP 6  ·  PHASE 1 |
| --- | --- |

Add — WhatsApp is a first-class channel, not a widget. Nigerians live there. A notification system that ignores WhatsApp will simply be ignored.

### User stories

- As a buyer, I want to reach an agent without handing over my personal number to a stranger.

- As an agent, I want leads that are identity-verified, so I stop wasting my day on time-wasters.

- As a diaspora buyer in a different timezone, I want to be notified where I actually read messages.

### Behaviour

- Contact details proxied. Real numbers are exchanged only when both parties consent. Until then, communication runs through Unö.

- Both sides verified before either speaks. Buyer at L2, agent at L4 and admin-approved.

- Fee schedule attached to the thread. The disclosed ledger is part of the conversation record, not a separate claim.

- WhatsApp for notification, in-app for record. New-message alerts, inspection reminders, and verification outcomes go out over WhatsApp Business API; the durable thread lives in Unö.

### The disintermediation reality

Phase 1 cannot prevent a conversation moving to private WhatsApp, and the product should not pretend otherwise. What it can do is make the on-platform version carry things private WhatsApp cannot: a verified counterparty, a fee schedule on the record, and a thread that survives a dispute. Phase 2 adds the part that actually holds people — the money.

### Later phases

Agent CRM-lite: lead management, inspection scheduling, and document handling inside Unö. The stickier the agent’s daily workflow, the less they want to take deals offline — structural retention rather than policy enforcement.

| 6.  Inspection Booking | BUILD STEP 7  ·  PHASE 1 |
| --- | --- |

Stage 3 of the milestone flow, and where Unö’s first genuinely paid service sits.

### User stories

- As a buyer, I want to book a viewing without a chain of phone calls.

- As a diaspora buyer, I want someone credible to physically confirm this property exists and matches the photos.

- As an agent, I want confirmed appointments with verified people, and reminders that reduce no-shows.

### Two products

| Product | Price | What happens | Produces |
| --- | --- | --- | --- |
| Self-inspection booking | Free | Scheduling, WhatsApp reminders to both parties, calendar sync, attendance confirmation. | Appointment record, attendance history on the agent’s track record. |
| Verified inspection report | Paid | A vetted surveyor attends, photographs to a standard template, and certifies whether the property matches the listing. | Inspection-Certified badge, report and photo set attached to the listing. |

The verified inspection report is the diaspora unlock and the first real revenue line. It also converts the anchor firm’s surveyor network directly into product — professional capacity becomes a sellable service without new infrastructure.

Trust gate: inspections can only be booked on listings held by an L4-verified agent, and the buyer must be L2. Payment is to Unö via Paystack. No buyer-to-seller money moves at this stage or anywhere in Phase 1.

| 7.  Verification Flow | BUILD STEP 8  ·  PHASE 1 |
| --- | --- |

Stage 4 of the milestone flow. Where the anchor firm’s work sits and where Unö’s core value is produced.

### User stories

- As a buyer, I want to commission a real registry check before I make an offer, not after money has moved.

- As an owner, I want to verify my property’s title even before I list it.

- As a solicitor at the anchor firm, I want to record a check outcome with its scope and date, attached to my name.

- As an agent, I want a verified badge that meaningfully distinguishes me.

### What a check covers

- Title document review — type, authenticity indicators, chain of ownership as presented.

- Registry search — does the title exist as claimed, and is it held by the person claiming it.

- Government acquisition overlap — automated PostGIS check against known acquisition zones, confirmed by the solicitor.

- Encumbrance check — recorded charges, mortgages, or caveats where discoverable.

- Duplicate check — title number cross-referenced against every other listing on Unö.

### Add — "Verify your property"

Zillow’s "claim your home" improves Zestimate accuracy. Unö’s equivalent lets an owner upload title documents and earn a verification badge on their property record even before listing it. This quietly builds a proprietary verified-title database, which becomes an enormous asset and eventually a standalone revenue product in Phase 4.

### Add — fraud detection engine

No Zillow equivalent, because Zillow sits on a vetted MLS and does not need one. Unö’s listings come from direct submissions, so it does:

- Perceptual hashing on every uploaded image, compared against the existing corpus — stolen listing photos are rampant.

- Duplicate title numbers checked across all listings on publish.

- Acquisition-zone overlap via PostGIS polygon check.

- Pricing anomalies flagged against area comparables.

Flag, never auto-reject. Anomalies route to an admin review queue. A machine can flag, queue, rank, and pre-fill. A human decides.

| 8.  Admin & Review Panel | BUILD STEP 8  ·  PHASE 1 |
| --- | --- |

Internal-facing, but it is what makes verification operationally real. Without it, a small ops team ends up editing the database directly — which is how legal artifacts get lost.

### Queues

| Queue | Who works it | Actions |
| --- | --- | --- |
| Agent applications | Reviewer | Approve, reject with reason, request more documents. No auto-approval, ever — the badge means nothing if a script grants it. |
| Listing documents | Reviewer | Review title docs, identify and risk-label the document type, set Document-Verified or bounce back. |
| Registry checks | Verifier (legal) — anchor firm solicitors / AEGIS | Record outcome, attach scope statement and date, name the verifying solicitor, assign or refuse Registry-Verified. |
| Fraud flags | Fraud analyst | Work duplicate titles, matched photo hashes, acquisition overlaps, pricing anomalies. Suspend pending review. |
| Reports & disputes | Support | Respond to reported listings, escalate. Read-mostly. |

Non-negotiables:

- Every admin action written to an append-only audit log: who, what, when, and the reason given. Verification decisions are legal artifacts and must be reconstructable years later.

- Two-factor authentication on every internal account from day one.

- Least privilege by default. Support does not approve verifications; reviewers do not assign roles.

| 9.  Agent & Firm Profiles | PHASE 1 (light)  ·  DEEPENS LATER |
| --- | --- |

Rebuild — Zillow shows sales volume drawn from MLS records. Unö has no such source and would not want it — self-reported volume is exactly what fraudsters inflate. Unö shows verification tier, CAC registration, ESVARBON/NIESV licensing where applicable, count of Unö-verified listings, completed inspections, response time, and dispute history.

Add — Firm profiles. Zillow is agent-centric; Nigeria is firm-centric. People trust J.U. Uzor & Associates before they trust an individual. Partner firms get branded profile pages carrying their full inventory — and this is precisely what is being offered in the anchor partnership.

Caution — Zillow’s "match me with a premier agent" is a paid-placement lead sale, and it is exactly what makes users distrust Zillow. Unö ranks by verification tier and completed-transaction quality only. If placement is ever monetised, it must be labelled unmistakably. The entire brand is trust; selling rankings quietly would poison it.

# Modules deferred to later phases

Documented so the data model anticipates them. Not built now.

| Module | Treatment | Phase | Note |
| --- | --- | --- | --- |
| 3D tour & floor plan | Clone + elevate | 2 | More than a premium upsell — the diaspora unlock and a fraud deterrent. You cannot fake a walkthrough of a property you do not have. |
| Escrow & milestone engine | Add | 2 | The transaction rail. Behind the security line. |
| Contracts & e-sign | Add | 2 | Tamper-evident audit log. No blockchain needed. |
| Comparable Listings Range | Rebuild | 2–3 | Asking prices, clearly labelled as such — never presented as sale prices. |
| Unö Estimate | Rebuild | 3+ | Only once real settled-price data accumulates. A wrong number destroys the trust you are selling. |
| Savings-to-Purchase Planner | Rebuild | 3 | Replaces Zillow’s mortgage affordability tool. Installment purchase is the primary path in Nigeria, not the exception. |
| Financing hub | Rebuild | 3 | Developer installment, cooperative schemes, NHF, rent-to-own. Unö is a neutral connector, never a lender. |
| Landlord / property management | Add | 3 | Annual rent cycle, service charge, renewals, maintenance. Strong retention and a natural subscription. |
| Community / estate pages | Add | 2–3 | High SEO value; captures how Nigerians actually search ("Gwarinpa", not an address). |

# Cross-cutting Nigerian adaptations

| Zillow assumption | Unö reality |
| --- | --- |
| USD, monthly rent | Naira (₦), per-annum rent quoting, one to two years upfront |
| Security deposit | Agency fee, caution fee, legal fee, service charge |
| MLS data feeds | Direct agent and owner submissions + Unö verification |
| Standardised addresses | Landmark, estate, and area-based search |
| Deep historical sales data | Comparable asking prices, evolving into own transaction data |
| Mortgage-default financing | Installment, off-plan, cooperative, NHF |
| Credit score | KYC via BVN/NIN identity — identity, not creditworthiness |
| Desktop-first, fast connections | Mobile-first, low-data mode, WhatsApp-native |
| Walk Score / GreatSchools | Distance-to-landmarks computed from Unö’s own gazetteer |
| Climate risk layer | Flood, power, water, security, road access, acquisition zones |

Connectivity and cost design. Compress aggressively, lazy-load galleries, offer a low-data toggle, cache saved listings offline. Data cost is a real barrier, and Zillow’s image-heavy design would be punishing on a Nigerian mobile plan. This is a first-class requirement, not an optimisation to revisit later.

# One product, not a portfolio

Zillow runs a family of sub-brands — Trulia, StreetEasy, HotPads. Unö should stay one product for years: neighbourhood intelligence, rentals, and agent reviews all folded in. Fragmenting a young brand splits trust, and trust is the one thing this company cannot afford to divide.

Phase the ambition. Search, listings, Trust Panel, fee ledger, WhatsApp, and inspection booking are Phase 1. 3D scans, escrow, and contracts are Phase 2. Valuation, financing hub, and property management are Phase 3+. Zillow took twenty years to build all of this — it should not be attempted in one release.

## Changelog

v1 — Nine Phase 1 modules mapped from Zillow to Nigerian conditions with user stories, key screens, and data shown; deferred module register; cross-cutting adaptation table; non-negotiable conventions.