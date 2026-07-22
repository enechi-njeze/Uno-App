import type {
  FeeLine,
  ListingType,
  QuoteBasis,
  TitleType,
  VerificationTier,
} from './types';

// Naira, quoted per annum. Group thousands manually — Hermes' Intl is patchy.
export function formatNaira(value: string | number | null): string {
  if (value === null || value === undefined) return 'Price on request';
  const n = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(n)) return 'Price on request';
  const grouped = Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `₦${grouped}`;
}

export function priceLabel(
  priceNaira: string | null,
  quoteBasis: QuoteBasis,
): string {
  const base = formatNaira(priceNaira);
  if (priceNaira === null) return base;
  return quoteBasis === 'per_annum' ? `${base}/yr` : base;
}

// Canonical labels — do not invent synonyms.
export const TIER_LABEL: Record<VerificationTier, string> = {
  'escrow-enabled': 'Escrow-Enabled',
  'inspection-certified': 'Inspection-Certified',
  'registry-verified': 'Registry-Verified',
  'document-verified': 'Document-Verified',
  listed: 'Listed',
};

export const TITLE_TYPE_LABEL: Record<TitleType, string> = {
  'c-of-o': 'C of O',
  'governors-consent': "Governor's Consent",
  'deed-of-assignment': 'Deed of Assignment',
  'letter-of-allocation': 'Letter of Allocation',
};

// Plain-language, one-line risk note per title type (full Trust Panel = Step 4).
export const TITLE_TYPE_RISK: Record<TitleType, string> = {
  'c-of-o': 'Strongest title. Certificate of Occupancy from the state.',
  'governors-consent': "Recognised transfer, consented by the Governor's office.",
  'deed-of-assignment': 'Transfer document; confirm it traces back to a root title.',
  'letter-of-allocation': 'Weaker than a C of O — verify carefully before paying.',
};

export const TYPE_LABEL: Record<ListingType, string> = {
  buy: 'For Sale',
  rent: 'For Rent',
  'short-let': 'Short-let',
  land: 'Land',
  'off-plan': 'Off-plan',
};

const FEE_KIND_LABEL: Record<string, string> = {
  'agency-commission': 'Agency commission',
  'caution-deposit': 'Caution / deposit',
  'legal-fee': 'Legal / agreement fee',
  'service-charge': 'Service charge',
  'survey-fee': 'Survey fee',
  'stamp-duty': 'Stamp duty',
  'governors-consent-fee': "Governor's Consent",
  registration: 'Registration',
  'platform-fee': 'Unö platform fee',
};

export function feeLabel(f: FeeLine): string {
  return f.label ?? FEE_KIND_LABEL[f.kind] ?? f.kind;
}

// Sum of price + all fee lines = a first Total Cost of Acquisition preview.
// The full calculator (with percentage-of-what semantics) is Step 5.
export function totalCostOfAcquisition(
  priceNaira: string,
  fees: FeeLine[],
): number {
  const base = Number(priceNaira) || 0;
  return fees.reduce((sum, f) => sum + (Number(f.amountNaira) || 0), base);
}

const TIER_COLORS: Record<VerificationTier, string> = {
  'escrow-enabled': '#0B6E4F',
  'inspection-certified': '#1F9D55',
  'registry-verified': '#1F9D55',
  'document-verified': '#C9A227',
  listed: '#8A8F8B',
};

export function tierColor(tier: VerificationTier): string {
  return TIER_COLORS[tier];
}

export function isVerified(tier: VerificationTier): boolean {
  return tier !== 'listed';
}
