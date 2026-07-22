import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

// Trust and Nigerian market conventions are first-class even in the skeleton,
// because the very first card we render has to look like Unö, not like a
// generic listing. These fields get their own tables/enums and validation in
// later steps (Trust Panel = step 4, Fee ledger = step 5); here they are the
// minimum needed to show one convincing card.

export type VerificationTier = 'unverified' | 'basic' | 'verified' | 'premium';

export type TitleType =
  | 'c_of_o' // Certificate of Occupancy — strongest
  | 'governors_consent'
  | 'deed_of_assignment'
  | 'excision'
  | 'gazette'
  | 'none';

export type ListingType = 'rent' | 'sale';

@Entity({ name: 'listings' })
export class Listing {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text', default: 'apartment' })
  propertyType!: string;

  @Column({ type: 'text', default: 'rent' })
  listingType!: ListingType;

  // Naira, stored as whole naira (no kobo) in a bigint to survive ₦-billions.
  // Rent is quoted PER ANNUM — never a monthly figure. Sale uses the same field.
  @Column({ type: 'bigint', nullable: true })
  priceNaira!: string | null;

  @Column({ type: 'int', nullable: true })
  bedrooms!: number | null;

  @Column({ type: 'int', nullable: true })
  bathrooms!: number | null;

  // Landmark-first: what people actually search ("Behind Shoprite, Jabi").
  @Column({ type: 'text' })
  landmark!: string;

  @Column({ type: 'text' })
  area!: string;

  @Column({ type: 'text', default: 'Abuja' })
  city!: string;

  @Column({ type: 'text', nullable: true })
  coverImageUrl!: string | null;

  @Column({ type: 'text', default: 'unverified' })
  verificationTier!: VerificationTier;

  @Column({ type: 'text', default: 'none' })
  titleType!: TitleType;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
