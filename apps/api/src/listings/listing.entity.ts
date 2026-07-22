import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  ListingStatus,
  ListingType,
  QuoteBasis,
  TitleType,
  VerificationTier,
} from './listing.enums';
import { ListingMedia } from './listing-media.entity';
import { FeeLine } from './fee-line.entity';

// A listing is the foundation record — everything else attaches to it.
// Fields anticipate later steps (verifying firm/solicitor, acquisition result,
// gazetteer FK) but Phase-1 Step-2 only populates what create/browse/detail need.
@Entity({ name: 'listing' })
export class Listing {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // --- Identity ---
  @Column({ type: 'enum', enum: ListingType })
  type!: ListingType;

  @Index()
  @Column({ type: 'enum', enum: ListingStatus, default: ListingStatus.PUBLISHED })
  status!: ListingStatus;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  // Owning agent/firm. No Auth/L4 system until later steps, so nullable for now
  // (see docs/step-2 notes). Kept as columns so the FK can be enforced later.
  @Column({ type: 'uuid', nullable: true })
  agentId!: string | null;

  @Column({ type: 'uuid', nullable: true })
  firmId!: string | null;

  // Display name of the agent/firm, denormalised for the card until profiles land.
  @Column({ type: 'text', nullable: true })
  agentName!: string | null;

  // --- Location (landmark-first; real gazetteer FK arrives in Step 3) ---
  @Column({ type: 'uuid', nullable: true })
  gazetteerId!: string | null;

  @Column({ type: 'text' })
  landmark!: string;

  @Column({ type: 'text' })
  area!: string;

  @Column({ type: 'text', default: 'Abuja' })
  city!: string;

  // PostGIS point (lng lat, SRID 4326). Nullable until geocoded via gazetteer.
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  geom!: object | null;

  // Optional land parcel polygon (used for acquisition-zone overlap in Step 8).
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Polygon',
    srid: 4326,
    nullable: true,
  })
  parcel!: object | null;

  // --- Money (bigint whole naira — never floats, never kobo) ---
  @Column({ type: 'bigint' })
  priceNaira!: string;

  @Column({ type: 'enum', enum: QuoteBasis })
  quoteBasis!: QuoteBasis;

  // Years of rent demanded upfront (rent/short-let). Null for buy/land/off-plan.
  @Column({ type: 'int', nullable: true })
  upfrontYears!: number | null;

  // --- Physical ---
  @Column({ type: 'int', nullable: true })
  bedrooms!: number | null;

  @Column({ type: 'int', nullable: true })
  bathrooms!: number | null;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  internalAreaSqm!: string | null;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  plotSizeSqm!: string | null;

  // Land is also quoted in plots; store both (Feature Spec: plots and sqm).
  @Column({ type: 'numeric', precision: 8, scale: 2, nullable: true })
  plotCount!: string | null;

  @Column({ type: 'int', nullable: true })
  yearBuilt!: number | null;

  @Column({ type: 'text', nullable: true })
  condition!: string | null;

  // --- Trust (populated by Steps 4/8; defaults are the honest floor) ---
  @Index()
  @Column({
    type: 'enum',
    enum: VerificationTier,
    default: VerificationTier.LISTED,
  })
  verificationTier!: VerificationTier;

  @Column({ type: 'enum', enum: TitleType })
  titleType!: TitleType;

  @Column({ type: 'text', nullable: true })
  verifyingFirmName!: string | null;

  @Column({ type: 'text', nullable: true })
  verifyingSolicitorName!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  verificationCheckedAt!: Date | null;

  @Column({ type: 'text', nullable: true })
  verificationScopeStatement!: string | null;

  // clear | overlap | not-checked (full flow in Step 8)
  @Column({ type: 'text', default: 'not-checked' })
  acquisitionZoneResult!: string;

  // --- Relations ---
  @OneToMany(() => ListingMedia, (m) => m.listing, { cascade: true })
  media!: ListingMedia[];

  @OneToMany(() => FeeLine, (f) => f.listing, { cascade: true })
  feeLines!: FeeLine[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
