// Mirrors the API response shapes. The fixed Unö vocabulary is shared verbatim.

export type VerificationTier =
  | 'listed'
  | 'document-verified'
  | 'registry-verified'
  | 'inspection-certified'
  | 'escrow-enabled';

export type TitleType =
  | 'c-of-o'
  | 'governors-consent'
  | 'deed-of-assignment'
  | 'letter-of-allocation';

export type ListingType = 'buy' | 'rent' | 'short-let' | 'land' | 'off-plan';

export type QuoteBasis = 'per_annum' | 'total';

export interface MediaSize {
  width: number;
  webp: string;
  avif: string;
}

export interface Media {
  id: string;
  ordinal: number;
  captureDate: string | null;
  sizes: MediaSize[];
  hero: MediaSize | null;
}

export interface FeeLine {
  id: string;
  kind: string;
  label: string | null;
  amountNaira: string;
  isPercentage: boolean;
  percentageBps: number | null;
  refundable: boolean;
  disclosedAt: string;
}

export interface ListingCard {
  id: string;
  type: ListingType;
  title: string;
  priceNaira: string;
  quoteBasis: QuoteBasis;
  upfrontYears: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  plotSizeSqm: string | null;
  plotCount: string | null;
  landmark: string;
  area: string;
  city: string;
  agentName: string | null;
  verificationTier: VerificationTier;
  titleType: TitleType;
  hero: Media | null;
}

export interface ListingDetail extends ListingCard {
  status: string;
  description: string | null;
  location: { lat: number; lng: number } | null;
  internalAreaSqm: string | null;
  yearBuilt: number | null;
  condition: string | null;
  verifyingFirmName: string | null;
  verifyingSolicitorName: string | null;
  verificationCheckedAt: string | null;
  verificationScopeStatement: string | null;
  acquisitionZoneResult: string;
  media: Media[];
  feeLines: FeeLine[];
  createdAt: string;
}

export interface CreateFeeLineInput {
  kind: string;
  label?: string;
  amountNaira: string;
  isPercentage?: boolean;
  percentageBps?: number;
  refundable?: boolean;
}

export interface CreateListingInput {
  type: ListingType;
  title: string;
  description?: string;
  agentName?: string;
  landmark: string;
  area: string;
  city?: string;
  lat?: number;
  lng?: number;
  priceNaira: string;
  quoteBasis: QuoteBasis;
  upfrontYears?: number;
  bedrooms?: number;
  bathrooms?: number;
  titleType: TitleType;
  feeLines: CreateFeeLineInput[];
}
