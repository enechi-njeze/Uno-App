import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// Nigeria has no reliable street addressing, so search runs on a hand-curated
// gazetteer of estates, districts, and landmarks (Tech Spec req #5). Aliases
// carry the common misspellings ("Gwarimpa" / "Gwarinpa"). Postgres is the
// source of truth; the search index is synced from this table.
export enum GazetteerKind {
  ESTATE = 'estate',
  DISTRICT = 'district',
  LANDMARK = 'landmark',
  AREA = 'area',
}

@Entity({ name: 'gazetteer_entry' })
export class GazetteerEntry {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'text' })
  name!: string;

  // Common misspellings / alternative names, for typo tolerance.
  @Column({ type: 'text', array: true, default: () => "'{}'" })
  aliases!: string[];

  @Column({ type: 'enum', enum: GazetteerKind })
  kind!: GazetteerKind;

  @Index()
  @Column({ type: 'text' })
  city!: string;

  // Centroid used for radius search from a chosen landmark.
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  geom!: object | null;

  // Optional boundary polygon (estate/district extents) for draw-your-own-area.
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Polygon',
    srid: 4326,
    nullable: true,
  })
  boundary!: object | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
