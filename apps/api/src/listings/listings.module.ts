import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Listing } from './listing.entity';
import { ListingMedia } from './listing-media.entity';
import { FeeLine } from './fee-line.entity';
import { GazetteerEntry } from '../gazetteer/gazetteer-entry.entity';
import { ListingsController } from './listings.controller';
import { ListingsService } from './listings.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Listing, ListingMedia, FeeLine, GazetteerEntry]),
  ],
  controllers: [ListingsController],
  providers: [ListingsService],
  exports: [ListingsService],
})
export class ListingsModule {}
