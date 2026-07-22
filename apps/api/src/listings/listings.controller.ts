import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { ListingType } from './listing.enums';

@Controller('listings')
export class ListingsController {
  constructor(private readonly listings: ListingsService) {}

  @Post()
  create(@Body() dto: CreateListingDto) {
    return this.listings.create(dto);
  }

  // Browse — verified-first. Basic filters here; the full trust-filter row and
  // landmark search arrive in Step 3.
  @Get()
  browse(
    @Query('type') type?: ListingType,
    @Query('city') city?: string,
    @Query('verified') verified?: string,
  ) {
    return this.listings.browse({
      type,
      city,
      verifiedOnly: verified === 'true' || verified === '1',
    });
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.listings.findOne(id);
  }
}
