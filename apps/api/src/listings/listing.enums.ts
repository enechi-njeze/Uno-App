// The fixed Unö vocabulary. These exact strings appear in the DB, the API, the
// product, and the partner conversation — do not invent synonyms.
// (Defined once here; the Trust Panel in Step 4 layers risk labels on top.)

// Listing intent — sets how prices are quoted and which fees apply downstream.
export enum ListingType {
  BUY = 'buy',
  RENT = 'rent',
  SHORT_LET = 'short-let',
  LAND = 'land',
  OFF_PLAN = 'off-plan',
}

export enum ListingStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  SUSPENDED = 'suspended', // fraud queue / admin action (Step 8)
  ARCHIVED = 'archived',
}

// How the headline price is expressed. Rent/short-let quote PER ANNUM.
export enum QuoteBasis {
  PER_ANNUM = 'per_annum',
  TOTAL = 'total', // buy / land / off-plan: the price is the price
}

// Verification tiers — Onboarding & Milestones §"shared vocabulary".
// Escrow-Enabled is Phase 2; present in the enum so the type is stable, never
// assignable in Phase 1.
export enum VerificationTier {
  LISTED = 'listed',
  DOCUMENT_VERIFIED = 'document-verified',
  REGISTRY_VERIFIED = 'registry-verified',
  INSPECTION_CERTIFIED = 'inspection-certified',
  ESCROW_ENABLED = 'escrow-enabled', // Phase 2 — do not assign in Phase 1
}

// Rank for verified-first ordering (lower = surfaces higher).
export const TIER_RANK: Record<VerificationTier, number> = {
  [VerificationTier.ESCROW_ENABLED]: 0,
  [VerificationTier.INSPECTION_CERTIFIED]: 1,
  [VerificationTier.REGISTRY_VERIFIED]: 2,
  [VerificationTier.DOCUMENT_VERIFIED]: 3,
  [VerificationTier.LISTED]: 4,
};

// Title types — exactly four. Risk labelling is added in the Trust Panel (Step 4).
export enum TitleType {
  C_OF_O = 'c-of-o', // Certificate of Occupancy — strongest
  GOVERNORS_CONSENT = 'governors-consent',
  DEED_OF_ASSIGNMENT = 'deed-of-assignment',
  LETTER_OF_ALLOCATION = 'letter-of-allocation', // materially weaker
}

// Fee ledger line kinds — Product Feature Spec §4 table. The full Total Cost of
// Acquisition calculator is Step 5; here we capture the itemised rows at
// creation (required), which the calculator later sums.
export enum FeeKind {
  AGENCY_COMMISSION = 'agency-commission',
  CAUTION_DEPOSIT = 'caution-deposit',
  LEGAL_FEE = 'legal-fee',
  SERVICE_CHARGE = 'service-charge',
  SURVEY_FEE = 'survey-fee',
  STAMP_DUTY = 'stamp-duty',
  GOVERNORS_CONSENT_FEE = 'governors-consent-fee',
  REGISTRATION = 'registration',
  PLATFORM_FEE = 'platform-fee', // Unö's own fee — stated plainly alongside the rest
}
