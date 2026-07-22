import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { Listing } from '../listings/listing.entity';
import { ListingMedia } from '../listings/listing-media.entity';
import { FeeLine } from '../listings/fee-line.entity';
import { GazetteerEntry } from '../gazetteer/gazetteer-entry.entity';

// Standalone DataSource for the TypeORM CLI (migration:generate/run/revert)
// and the seed script. The running app configures its own connection in
// app.module.ts; this one exists so tooling has a single source of truth.
config();

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Listing, ListingMedia, FeeLine, GazetteerEntry],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
});
