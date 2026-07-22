Unö

Onboarding & Milestones

Role-based onboarding and the nine-stage transaction flow, end to end.

Companion to the Build Brief, Strategy Roadmap, Product Feature Spec, and Tech Spec.

Version 1  ·  July 2026  ·  Confidential

# How to read this document

This doc does two jobs. The first half defines how each type of user gets into Unö and what they can do at each level of identity verification. The second half defines the nine stages a property transaction passes through, from first search to handover.

Most of the nine stages are Phase 2 or later. They are documented now anyway, for two reasons: the Phase 1 data model has to leave room for them, and the flow is what makes the partnership concrete — it shows exactly where the anchor firm’s legal work plugs into the product.

Phase markers used throughout:

| Marker | Meaning |
| --- | --- |
| PHASE 1 | Built now. In the Trust MVP scope. No customer money moves. |
| PHASE 2+ | Documented now, built later, behind the security line (experienced engineer + security review). |

Assumptions in this document are marked [ASSUMPTION]. The tier names, KYC thresholds, and stage boundaries are proposals — the anchor firm should be able to redline them, because they carry the professional risk on what a verification means.

# Part One — Onboarding

## The governing rule

Light KYC to browse. Full KYC to transact.

Nigerians will abandon an app that demands a NIN before showing a single photo. Equally, no serious verification can rest on an anonymous account. Unö resolves this by gating action, not access: browsing, saving, and searching are near-frictionless; contacting an agent, booking an inspection, listing a property, or moving through a transaction milestone each raise the identity bar one step.

Every escalation is asked for at the moment it is needed, with a plain sentence explaining why. Never a wall of forms at signup.

## Identity levels

| Level | What is collected | What it unlocks | Phase |
| --- | --- | --- | --- |
| L0 — Anonymous | Nothing. Device-local only. | Browse listings, search, view Trust Panel, view fee ledger. Saved items held locally on device. | 1 |
| L1 — Light KYC | Phone number (OTP) + email. Display name. | Save listings and searches across devices, set alerts, follow estates, receive WhatsApp notifications. | 1 |
| L2 — Verified identity | NIN or BVN via licensed KYC provider (Smile ID / Dojah). Selfie liveness check. | Contact an agent, book an inspection, submit a listing enquiry, leave a review. | 1 |
| L3 — Transacting party | L2 plus proof of address, source-of-funds declaration where thresholds require. | Enter a gated transaction, sign contracts, move money through escrow. | 2+ |
| L4 — Professional | L2 plus CAC registration, ESVARBON / NIESV credentials where applicable, firm affiliation, professional indemnity where held. | List properties, appear in agent directory, receive leads, access agent CRM. | 1 |

[ASSUMPTION] L2 is required to contact an agent. This is a deliberate friction point and the most debatable choice in this doc — it protects agents from time-wasters and fraud, but it will cost some top-of-funnel. Worth A/B testing once volume exists. The alternative is L1 to contact, L2 to book an inspection.

Diaspora note: many diaspora users hold a NIN but not a BVN, or neither if they have lived abroad for years. The KYC adapter must accept international passport plus proof of address as an L2-equivalent path, or Unö locks out its highest-value segment. Flag this to the KYC provider during selection.

## Buyer / renter onboarding

Goal: get to a relevant listing in under sixty seconds, on a bad connection, without an account.

### Flow

- Open app → straight to search. No signup wall, no carousel of marketing screens. Location permission is offered, not demanded; declining falls back to a city picker (Abuja / Lagos).

- Intent selector. One tap: Buy · Rent · Short-let · Land · Off-plan. This sets the entire downstream experience, including how prices are quoted and which fees appear in the ledger.

- Landmark-first search. Typo-tolerant autocomplete over the curated gazetteer of estates, districts, and landmarks. "Gwarinpa", "behind Shoprite Jabi", "Lekki Phase 1" — not street addresses.

- Results, verified-first. Verification tier is visible on every card before the user taps anything. The trust filter row sits above the results, defaulted to verified-first.

- Listing detail. Trust Panel above the fold. Total Cost of Acquisition ledger immediately below. Photos, then everything else.

- First save → L1 prompt. "Save this so you don’t lose it — we’ll just need your number." OTP, done. No password.

- First contact or inspection booking → L2 prompt. "Agents on Unö only deal with verified people. It takes about a minute and protects you too." NIN/BVN + liveness.

- Channel preference. Ask once, at L1: WhatsApp, push, or both. Default WhatsApp. This is where Nigerians actually read messages.

### What the buyer is taught along the way

Onboarding is also education. Most Nigerian buyers do not know a Letter of Allocation is materially weaker than a Certificate of Occupancy. Unö teaches this inline, at the moment it matters, not in a help centre nobody opens:

- First time a user views a listing with a weaker title type, a one-line plain-language explainer appears next to the title, expandable for detail.

- First time a user opens the fee ledger, a short note explains why the headline price is not the real cost.

- First time a user sees an unverified listing, the badge explains what has and has not been checked.

This is cheap to build and it is the highest-leverage trust marketing Unö has. A buyer who learns the difference between a C of O and a Letter of Allocation from Unö does not go back to a noticeboard.

## Agent / firm onboarding

Goal: make being legitimate feel like an advantage, not an audit.

Framing matters here. The honest Nigerian agent is currently indistinguishable from the fraudulent one, and has quietly resented that for years. Onboarding should read as finally, a place where your reputation counts — not as a compliance obstacle.

### Flow

- Choose account type. Independent agent · Agent within a firm · Firm administrator · Developer. Firm administrators can invite and manage agents under the firm profile.

- L2 identity. NIN/BVN + liveness. Same as a buyer. This is the floor.

- L4 professional credentials. CAC registration number, ESVARBON / NIESV membership where applicable, firm affiliation, years active, references. Professional indemnity cover recorded where held.

- Admin review. A human reviews every professional application in the admin panel. Approve, reject with reason, or request more documents. No auto-approval — the badge means nothing if a script grants it.

- Conduct undertaking. Explicit agreement to fee transparency, no off-platform fee demands, no discriminatory listing language, accurate representation of title status. Short, in plain English, signed at onboarding.

- First listing, guided. The listing creation flow doubles as training: it asks for title type, documents, and fee breakdown as required fields, so the agent learns Unö’s standard by using it.

- Badge issued. Verification tier appears on the agent profile and on every listing they hold. Track record accumulates from here: verified listings, completed inspections, response time, dispute history.

### Firm onboarding

Nigeria is firm-centric. People trust J.U. Uzor & Associates before they trust an individual agent, and the anchor partnership depends on this being handled well. A firm gets:

- A branded profile page carrying the firm’s name, credentials, and full inventory.

- Agent seats under the firm, with the firm administrator able to invite, suspend, and reassign listings.

- Firm-level verification, so a new agent joining an already-verified firm inherits a faster review path rather than starting cold.

- Where the firm performs verifications: attribution on the Trust Panel — "Registry check by J.U. Uzor & Associates" — appearing on every listing they clear.

[ASSUMPTION] Inherited verification for agents at a verified firm shortens review but does not skip identity checks. Every individual still completes L2 personally. The firm vouches for competence, not identity.

## Admin / internal onboarding

Goal: a small ops team can run verification, fraud triage, and disputes without touching the database directly.

| Role | Who holds it | Can do |
| --- | --- | --- |
| Reviewer | Ops staff | Work the verification queue: review agent applications and listing documents, approve, reject with reason, request more information. |
| Verifier (legal) | Anchor firm solicitors / AEGIS | Record registry check outcomes, set title-type risk labelling, attach the verifying solicitor’s name, assign or refuse the Registry-Verified tier. |
| Fraud analyst | Ops staff | Work the flagged queue: duplicate title numbers, matched photo hashes, acquisition-zone overlaps, pricing anomalies. Suspend listings pending review. |
| Support | Ops staff | View user and listing records, respond to reports, escalate. Read-mostly. |
| Administrator | Founder / technical lead | All of the above, plus role assignment, tier definitions, gazetteer edits, and audit-log access. |

Non-negotiables for internal access:

- Every admin action is written to an append-only audit log: who, what, when, and the reason given. Verification decisions are legal artifacts and must be reconstructable years later.

- Nobody auto-approves. A machine can flag, queue, rank, and pre-fill. A human decides.

- Two-factor authentication on every internal account, from day one, no exceptions.

- Least privilege by default. Support does not need to approve verifications; reviewers do not need role assignment.

## Verification tiers — the shared vocabulary

Every part of the product refers back to these tiers: the Trust Panel, search filters, agent profiles, and the transaction gates in Part Two. They need to be defined once, precisely, and never over-claimed.

| Tier | What has actually been checked | What it does NOT warrant | Phase |
| --- | --- | --- | --- |
| Listed | Nothing beyond a submission from an L2-identified account. Basic automated fraud screening only. | Anything. The property may not exist. Displayed with an explicit caution. | 1 |
| Document-Verified | Title documents supplied and reviewed by a qualified reviewer. Document type identified and risk-labelled. Photos screened for reuse. Agent is L4-verified. | That the document is genuine at the registry, or that the seller has the right to sell. | 1 |
| Registry-Verified | A named solicitor has conducted a registry search and confirmed the title exists, matches the parcel, and is held as claimed. Acquisition-zone overlap checked. Date and verifying firm recorded. | Future encumbrance, undisclosed family claims, or events after the check date. Every check carries a date and a scope statement. | 1 |
| Inspection-Certified | A vetted surveyor has physically attended, photographed, and certified that the property matches the listing. Add-on to any tier above. | Legal title. This is a physical-reality check, not a legal one. | 1 |
| Escrow-Enabled | Registry-Verified, plus the seller has agreed to transact through the licensed escrow partner under gated milestones. | — | 2+ |

The discipline that protects the company: every tier states its scope and its limits, in the product, in plain language, where the buyer sees it. A verification that quietly implies more than it checked is the single fastest route to the existential risk in the Strategy Roadmap. Under-claim deliberately.

# Part Two — The nine-stage transaction flow

A Nigerian property transaction has a shape. Unö’s job is to make that shape visible, gate it so the dangerous steps cannot be skipped, and — from Phase 2 — hold money, contract, and title so they move together.

Money, contract, and title move together through gated milestones. Leaving the platform means losing all three protections.

Stages 1 to 4 are Phase 1: discovery, contact, inspection, and verification. They are everything up to the point where money moves. Stages 5 to 9 are Phase 2 and beyond, behind the security line.

## The flow at a glance

| # | Stage | Identity level | Money moves | Phase |
| --- | --- | --- | --- | --- |
| 1 | Discovery | L0 – L1 | No | 1 |
| 2 | Contact & qualification | L2 | No | 1 |
| 3 | Inspection | L2 | Fee to Unö only | 1 |
| 4 | Verification & due diligence | L2 | Fee to Unö only | 1 |
| 5 | Offer & acceptance | L3 | No | 2+ |
| 6 | Contract | L3 | No | 2+ |
| 7 | Escrow funding | L3 | Yes — into escrow | 2+ |
| 8 | Title transfer | L3 | Held in escrow | 2+ |
| 9 | Settlement & handover | L3 | Yes — released | 2+ |

| Stage 1 — Discovery | PHASE 1 |
| --- | --- |

The buyer searches, filters, and saves. Nothing is committed. This stage exists to establish, before any conversation starts, that verification status is the primary axis on which properties are compared.

| Identity required | L0 to browse. L1 to save, set alerts, or follow an estate. |
| --- | --- |
| Trust gate | None — but verified listings surface first, and every card carries its tier. |
| Money | None. |
| Title | Title type and risk label visible on every listing before contact. |
| Unö holds | Search history, saved listings, alert preferences. |
| Anchor firm role | Its inventory is the seed catalogue and carries the top tier from day one. |

What has to be true to leave this stage: the buyer has seen the Trust Panel and the Total Cost of Acquisition ledger for the property they are about to enquire about. Both are above or immediately below the fold, deliberately, so nobody makes contact on a headline price alone.

| Stage 2 — Contact & qualification | PHASE 1 |
| --- | --- |

Buyer and agent connect. This is the stage where Nigerian transactions traditionally disappear into WhatsApp and become unrecorded, so the design intent is not to prevent that conversation but to make the Unö-mediated version genuinely better: contact details proxied, fees already disclosed, both parties identity-verified.

| Identity required | L2 for the buyer. L4 for the agent. Both sides are verified people before either speaks. |
| --- | --- |
| Trust gate | Buyer cannot contact until L2 complete. Agent cannot receive leads until admin-approved. |
| Money | None. |
| Title | No change. |
| Unö holds | The message thread, the enquiry record, the disclosed fee schedule, response times. |
| Channel | In-app chat, with WhatsApp notification of new messages. Contact details proxied — real numbers exchanged only when both parties consent. |

The disintermediation reality: Phase 1 cannot prevent the conversation moving off-platform, and should not pretend to. What it can do is make the on-platform version carry things WhatsApp cannot — a verified counterparty, a fee schedule that is on the record, and a thread that survives a dispute. Phase 2 adds the part that actually holds people: the money.

| Stage 3 — Inspection | PHASE 1 |
| --- | --- |

The buyer sees the property, in person or by proxy. For diaspora buyers this is the stage that has historically been outsourced to a relative and gone wrong, and it is where Unö’s first genuinely paid service sits.

| Identity required | L2. |
| --- | --- |
| Trust gate | Inspection can only be booked on listings held by an L4-verified agent. |
| Money | Inspection or report fee paid to Unö via Paystack. No buyer-to-seller money at this stage. |
| Title | No change. |
| Unö holds | Appointment record, reminders, attendance confirmation, inspection report and photographs where the paid report is purchased. |
| Anchor firm role | Surveyor network supplies the vetted inspectors for certified reports. |

Two products live here:

- Self-inspection booking. Free. Scheduling, WhatsApp reminders to both parties, calendar sync, attendance confirmation.

- Verified inspection report. Paid. A vetted surveyor attends, photographs to a standard template, and certifies whether the property matches the listing. Produces the Inspection-Certified badge. This is the diaspora unlock and the first real revenue line.

| Stage 4 — Verification & due diligence | PHASE 1 |
| --- | --- |

The legal check. This is where the anchor firm’s work sits, where Unö’s core value is produced, and — commercially — where the flagship paid service lives. In a traditional Nigerian transaction this happens late, informally, and often after money has already changed hands. Unö moves it before the offer.

| Identity required | L2 for the buyer commissioning the check. Seller identity confirmed as part of the check. |
| --- | --- |
| Trust gate | Outcome sets the listing’s verification tier. A failed check suspends the listing and routes to the fraud queue. |
| Money | Verification fee paid to Unö via Paystack, shared with the performing firm. Still no buyer-to-seller money. |
| Title | Title type confirmed and risk-labelled. Registry search recorded with date, scope, and verifying solicitor named. |
| Unö holds | Document set, registry check outcome, acquisition-zone result, verifier identity, timestamps — all in the append-only record. |
| Anchor firm role | Performs the check. Its name appears on the Trust Panel. This is the partnership made visible. |

What the check covers:

- Title document review — type, authenticity indicators, chain of ownership as presented.

- Registry search — does the title exist as claimed, and is it held by the person claiming it.

- Government acquisition overlap — automated geospatial check against known acquisition zones, confirmed by the solicitor.

- Encumbrance check — recorded charges, mortgages, or caveats where discoverable.

- Duplicate check — title number cross-referenced against every other listing on Unö.

Scope discipline: the outcome is published with an explicit statement of what was and was not checked, and the date it was checked. A registry search is a snapshot, not a guarantee, and saying so plainly is what keeps the tier honest and the company insurable.

[ASSUMPTION — the critical open question] This stage assumes a registry check can be completed in days at a price a normal Abuja buyer will pay. If the real answer is three weeks and a large fee, the productisation problem is harder than the software problem and the tier structure needs rethinking. This is the first thing to resolve in the Nigeria meeting.

Phase 1 ends here. Everything below is documented so the data model and the partnership conversation can anticipate it — but it is not built until an experienced engineer is on the team and a security review is complete.

| Stage 5 — Offer & acceptance | PHASE 2+ |
| --- | --- |

The buyer makes a formal offer through the platform; the seller accepts, rejects, or counters. Recorded rather than verbal, which is itself a meaningful change from current practice.

| Identity required | L3 both sides — full KYC, proof of address, source-of-funds declaration where thresholds require. |
| --- | --- |
| Trust gate | Offers can only be made on Registry-Verified listings. This is the structural incentive for sellers to verify. |
| Money | None. No deposit is taken outside escrow, ever. |
| Title | No change. |
| Unö holds | Offer terms, counter-offers, acceptance timestamp, the agreed fee split, and the final Total Cost of Acquisition ledger both parties have seen. |

The fee ledger locks here. Agency commission, legal fee, survey fee, stamp duty, Governor’s Consent, registration, and platform fee are itemised and agreed before acceptance. Any charge that appears later and was not on this ledger is a policy breach and a dispute trigger. This single mechanism addresses the most common and most resented failure in Nigerian property transactions.

| Stage 6 — Contract | PHASE 2+ |
| --- | --- |

The agreement is generated, reviewed, and executed. Tamper-evidence is the requirement — the platform must be able to prove exactly what was signed and when, years later, in a dispute.

| Identity required | L3 both sides. |
| --- | --- |
| Trust gate | Contract cannot be generated until the verification record is current and the offer accepted. |
| Money | None yet. |
| Title | Contract specifies the title being transferred and the consent path required. |
| Unö holds | Contract PDF in versioned storage; SHA-256 hash, timestamp, and signer identities in the append-only audit log. No blockchain — a write-once audit trail and good backups do the job. |
| Anchor firm role | Drafts or reviews the instrument. Legal work stays with lawyers; Unö provides the rail, not the advice. |

| Stage 7 — Escrow funding | PHASE 2+ |
| --- | --- |

The buyer funds the transaction into a licensed third-party escrow account. This is the stage that changes the Nigerian property market, and it is the stage Unö must be most careful about: Unö never holds the money. Custody sits with a licensed partner, behind an adapter interface. Holding funds directly would make Unö a regulated financial institution — a different company entirely.

| Identity required | L3, plus any additional KYC the escrow partner requires. |
| --- | --- |
| Trust gate | Funding is only possible on an Escrow-Enabled listing with a signed contract on record. |
| Money | Buyer funds move into the licensed partner’s escrow account. Naira. Diaspora FX path is Phase 3. |
| Title | No change yet — this is precisely the point. Money is committed but not released. |
| Unö holds | Escrow reference, funding confirmation, milestone state. Never the funds themselves. |

This is the security line in physical form. Nothing in this stage gets built by a non-technical founder with AI assistance. Experienced engineer, security review, and a licensed partner, or it does not get built.

| Stage 8 — Title transfer | PHASE 2+ |
| --- | --- |

The legal transfer executes while the money sits in escrow. Deed of Assignment, Governor’s Consent where required, stamp duty, and registration — each a tracked sub-milestone with its own status, because this is the part that takes months and where buyers lose visibility and confidence.

| Identity required | L3 both sides. |
| --- | --- |
| Trust gate | Each sub-milestone is confirmed by the acting solicitor before the next unlocks. |
| Money | Held in escrow. Statutory fees may be released against evidence, under partner rules. |
| Title | Transferring. Sub-milestones: deed executed → consent applied → consent granted → stamp duty paid → registration lodged → registration complete. |
| Unö holds | Every sub-milestone timestamp, evidence document, and the acting solicitor’s identity. |
| Anchor firm role | Executes and confirms each sub-milestone. Its updates are what the buyer watches. |

Visibility is the product here. Governor’s Consent can take months and the silence during that wait is where trust historically collapses — buyers assume they have been defrauded because nobody tells them anything. A visible milestone tracker with WhatsApp updates at each step is, for a diaspora buyer, worth as much as the escrow itself.

| Stage 9 — Settlement & handover | PHASE 2+ |
| --- | --- |

Escrow releases against confirmed transfer. Possession passes. The transaction closes and becomes a permanent record — which is where the long-game data moat begins to compound.

| Identity required | L3 both sides. |
| --- | --- |
| Trust gate | Release requires confirmed registration or the agreed contractual trigger. Disputes freeze release and route to dispute tooling. |
| Money | Escrow releases to seller. Agency commission and platform fee settle from the locked ledger — no surprises, because everything was agreed at Stage 5. |
| Title | Transferred and registered. Recorded against the property record permanently. |
| Unö holds | The completed transaction: settled price, timeline, parties, fees, and verification history. |
| What it produces | A verified title record, a completed-transaction credit on both parties’ track records, and one more datapoint toward the Unö Estimate. |

Why this stage matters beyond the deal: every completed transaction adds a real settled price to a dataset that does not otherwise exist in Nigeria. That is what eventually replaces the Comparable Listings Range with a genuine valuation model, and it is a moat no competitor can copy without building the same escrow rail first.

# Where Phase 1 fits

Read against the nine stages, the Trust MVP delivers a complete, honest experience of the first four — and stops cleanly at the line where money would move.

| Phase 1 delivers | Phase 2 adds |
| --- | --- |
| Search, save, alerts (Stage 1) | Formal offers and acceptance (Stage 5) |
| Verified contact and proxied chat (Stage 2) | Contract generation, e-sign, audit log (Stage 6) |
| Inspection booking and certified reports (Stage 3) | Licensed escrow funding (Stage 7) |
| Registry verification and Trust Panel (Stage 4) | Tracked title transfer sub-milestones (Stage 8) |
| Fee ledger, disclosed early | Settlement, release, and permanent record (Stage 9) |
| Agent and firm verification, admin review | Dispute tooling and remediation |

The demo narrative for Julie and for a prospective co-founder: a buyer finds a genuinely verified property, sees exactly what it will cost in total, contacts a verified agent, books an inspection, and reads a registry check performed by a named firm — all on a phone, on Nigerian data. Then the honest sentence: "and the next thing we build is the part that holds the money, which is why we need you."

# Open questions for the anchor firm

These are the points in this document that the anchor firm should be invited to redline, because they carry the professional risk on the answers.

- Turnaround and cost of a registry check. Sets whether Stage 4 works as designed. Everything downstream depends on it.

- The minimum documentary standard the firm would stake its name on. This becomes the Registry-Verified definition, verbatim.

- The scope statement. What exactly does a verification warrant, and what does it explicitly not? This wording is the company’s liability shield and should be the firm’s words, not ours.

- Lagos coverage. A different registry and a different network. Which partners cover it?

- Indemnity and remediation. What happens, concretely, if a Registry-Verified listing turns out to be fraudulent? Agreeing this before launch is what makes the tier credible.

## Changelog

v1 — Five identity levels, buyer/agent/firm/admin onboarding flows, five verification tiers with explicit scope limits, and the nine-stage transaction flow with Phase 1 / Phase 2+ boundaries, trust gates, and money/contract/title movement per stage.