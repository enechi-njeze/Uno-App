// Mirrors the API's Listing shape (apps/api/src/listings/listing.entity.ts).
// In a later step this can be generated/shared, but for the skeleton a
// hand-kept copy keeps the two apps independent.

export type VerificationTier = 'unverified' | 'basic' | 'verified' | 'premium';

export type TitleType =
  | 'c_of_o'
  | 'governors_consent'
  | 'deed_of_assignment'
  | 'excision'
  | 'gazette'
  | 'none';

export type ListingType = 'rent' | 'sale';

export interface Listing {
  id: string;
  title: string;
  propertyType: string;
  listingType: ListingType;
  priceNaira: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  landmark: string;
  area: string;
  city: string;
  coverImageUrl: string | null;
  verificationTier: VerificationTier;
  titleType: TitleType;
  createdAt: string;
}
