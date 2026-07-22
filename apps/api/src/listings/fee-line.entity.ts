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
import { FeeKind } from './listing.enums';

// One itemised charge on a listing. Fee lines are ROWS, not a JSON blob, so the
// ledger is queryable and comparable across listings (Tech Spec) — and from
// Phase 2, lockable at offer acceptance. Required at listing creation; the
// Total Cost of Acquisition calculator (Step 5) sums these.
@Entity({ name: 'fee_line' })
export class FeeLine {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @ManyToOne(() => Listing, (l) => l.feeLines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'listing_id' })
  listing!: Listing;

  @Column({ type: 'uuid', name: 'listing_id' })
  listingId!: string;

  @Column({ type: 'enum', enum: FeeKind })
  kind!: FeeKind;

  // Optional human label to override the default kind label.
  @Column({ type: 'text', nullable: true })
  label!: string | null;

  // Whole naira (bigint). When isPercentage, this is basis points of the price
  // instead — kept as bigint to avoid floats even for percentages.
  @Column({ type: 'bigint' })
  amountNaira!: string;

  @Column({ type: 'boolean', default: false })
  isPercentage!: boolean;

  // For percentage fees: basis points (e.g. 1000 = 10%). Null for flat fees.
  @Column({ type: 'int', nullable: true })
  percentageBps!: number | null;

  @Column({ type: 'boolean', default: false })
  refundable!: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'disclosed_at' })
  disclosedAt!: Date;
}
