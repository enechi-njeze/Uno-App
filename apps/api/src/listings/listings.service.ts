import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Listing } from './listing.entity';

@Injectable()
export class ListingsService implements OnModuleInit {
  private readonly logger = new Logger(ListingsService.name);

  constructor(
    @InjectRepository(Listing)
    private readonly listings: Repository<Listing>,
  ) {}

  // Seed exactly one listing on first boot so the skeleton renders a real card
  // read from Postgres (not hardcoded in the client). Idempotent: if any row
  // exists we leave the table alone.
  async onModuleInit() {
    const count = await this.listings.count();
    if (count > 0) {
      return;
    }
    await this.listings.save(
      this.listings.create({
        title: '3-Bedroom Serviced Apartment',
        propertyType: 'apartment',
        listingType: 'rent',
        priceNaira: '4500000', // ₦4,500,000 per annum
        bedrooms: 3,
        bathrooms: 3,
        landmark: 'Behind Shoprite, Jabi',
        area: 'Jabi',
        city: 'Abuja',
        coverImageUrl:
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=70',
        verificationTier: 'verified',
        titleType: 'c_of_o',
      }),
    );
    this.logger.log('Seeded 1 hardcoded listing (skeleton spine).');
  }

  findAll(): Promise<Listing[]> {
    // Verified-first ordering is a core Unö rule — surface it from day one.
    return this.listings
      .createQueryBuilder('l')
      .orderBy(
        // Column is camelCase, so it must be quoted or Postgres folds it to
        // lowercase and can't find it.
        `CASE l."verificationTier"
           WHEN 'premium' THEN 0
           WHEN 'verified' THEN 1
           WHEN 'basic' THEN 2
           ELSE 3 END`,
        'ASC',
      )
      .addOrderBy('l.createdAt', 'DESC')
      .getMany();
  }

  findOne(id: string): Promise<Listing | null> {
    return this.listings.findOne({ where: { id } });
  }
}
