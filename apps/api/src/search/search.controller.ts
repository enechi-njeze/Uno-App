import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { ListingsService } from '../listings/listings.service';
import { ListingType } from '../listings/listing.enums';

@Controller('search')
export class SearchController {
  constructor(
    private readonly search: SearchService,
    private readonly listings: ListingsService,
  ) {}

  // Typo-tolerant landmark autocomplete. The primary search entry point —
  // landmark-first, address-second.
  @Get('landmarks')
  landmarks(@Query('q') q = '', @Query('city') city?: string) {
    return this.search.suggest(q, city);
  }

  // Listings near a chosen landmark (or point), verified-first then nearest.
  @Get('listings')
  searchListings(
    @Query('gazetteerId') gazetteerId?: string,
    @Query('type') type?: ListingType,
    @Query('city') city?: string,
    @Query('verified') verified?: string,
    @Query('radiusM') radiusM?: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
  ) {
    return this.listings.searchNear({
      gazetteerId,
      type,
      city,
      verifiedOnly: verified === 'true' || verified === '1',
      radiusM: radiusM ? Number(radiusM) : undefined,
      lat: lat ? Number(lat) : undefined,
      lng: lng ? Number(lng) : undefined,
    });
  }
}
