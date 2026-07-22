import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Listing } from './listing.entity';

// One image on a listing, plus its generated derivatives and perceptual hash.
// Never serve the original to a phone — the derivatives map holds the multi-size
// WebP/AVIF the client actually loads (low-data rule). phash feeds the
// stolen-photo fraud check in Step 8; we populate it here, matching comes later.
export interface MediaDerivative {
  width: number;
  webp: string; // storage key
  avif: string; // storage key
}

@Entity({ name: 'listing_media' })
export class ListingMedia {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @ManyToOne(() => Listing, (l) => l.media, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'listing_id' })
  listing!: Listing;

  @Column({ type: 'uuid', name: 'listing_id' })
  listingId!: string;

  // Ordering within the gallery. 0 = hero image.
  @Column({ type: 'int', default: 0 })
  ordinal!: number;

  // Storage key of the original (behind the StorageProvider adapter).
  @Column({ type: 'text' })
  originalKey!: string;

  // Multi-size derivatives, ordered small→large.
  @Column({ type: 'jsonb', default: () => "'[]'" })
  derivatives!: MediaDerivative[];

  // 64-bit perceptual hash as a bit-string. Nullable if hashing failed.
  @Column({ type: 'varchar', length: 64, nullable: true })
  phash!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  captureDate!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
