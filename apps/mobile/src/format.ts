import type { TitleType, VerificationTier } from './types';

// Naira, quoted per annum. Hermes' Intl support is patchy on Android, so we
// group thousands manually rather than trust Intl.NumberFormat('en-NG').
export function formatNaira(value: string | number | null): string {
  if (value === null || value === undefined) {
    return 'Price on request';
  }
  const n = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(n)) {
    return 'Price on request';
  }
  const grouped = Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `₦${grouped}`;
}

export function priceLabel(
  priceNaira: string | null,
  listingType: 'rent' | 'sale',
): string {
  const base = formatNaira(priceNaira);
  if (priceNaira === null) return base;
  return listingType === 'rent' ? `${base}/yr` : base;
}

// Human labels for the trust fields. Full risk labeling is step 4; this is the
// minimal mapping the first card needs.
export const TITLE_TYPE_LABEL: Record<TitleType, string> = {
  c_of_o: 'C of O',
  governors_consent: "Governor's Consent",
  deed_of_assignment: 'Deed of Assignment',
  excision: 'Excision',
  gazette: 'Gazette',
  none: 'No title doc',
};

export const TIER_LABEL: Record<VerificationTier, string> = {
  premium: 'Premium Verified',
  verified: 'Verified',
  basic: 'Basic',
  unverified: 'Unverified',
};
