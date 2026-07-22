import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Listing } from './listing.entity';
import { FeeLine } from './fee-line.entity';
import {
  ListingStatus,
  ListingType,
  VerificationTier,
} from './listing.enums';
import { CreateListingDto } from './dto/create-listing.dto';
import { STORAGE_PROVIDER, StorageProvider } from '../storage/storage-provider';
import { serializeCard, serializeDetail } from './listing.serializer';

export interface BrowseFilters {
  type?: ListingType;
  city?: string;
  verifiedOnly?: boolean; // Document-Verified and above
}

@Injectable()
export class ListingsService {
  constructor(
    @InjectRepository(Listing)
    private readonly listings: Repository<Listing>,
    @InjectRepository(FeeLine)
    private readonly feeLines: Repository<FeeLine>,
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
  ) {}

  async create(dto: CreateListingDto) {
    const listing = this.listings.create({
      type: dto.type,
      status: ListingStatus.PUBLISHED,
      title: dto.title,
      description: dto.description ?? null,
      agentName: dto.agentName ?? null,
      landmark: dto.landmark,
      area: dto.area,
      city: dto.city ?? 'Abuja',
      // PostGIS point as GeoJSON (lng, lat) — nullable until geocoded.
      geom:
        dto.lat != null && dto.lng != null
          ? { type: 'Point', coordinates: [dto.lng, dto.lat] }
          : null,
      priceNaira: dto.priceNaira,
      quoteBasis: dto.quoteBasis,
      upfrontYears: dto.upfrontYears ?? null,
      bedrooms: dto.bedrooms ?? null,
      bathrooms: dto.bathrooms ?? null,
      internalAreaSqm: dto.internalAreaSqm ?? null,
      plotSizeSqm: dto.plotSizeSqm ?? null,
      plotCount: dto.plotCount ?? null,
      yearBuilt: dto.yearBuilt ?? null,
      condition: dto.condition ?? null,
      titleType: dto.titleType,
      // Verification tier is never client-set — a new listing is only 'Listed'
      // until a human verifies it (Steps 4/8).
      verificationTier: VerificationTier.LISTED,
      feeLines: dto.feeLines.map((f) =>
        this.feeLines.create({
          kind: f.kind,
          label: f.label ?? null,
          amountNaira: f.amountNaira,
          isPercentage: f.isPercentage ?? false,
          percentageBps: f.percentageBps ?? null,
          refundable: f.refundable ?? false,
        }),
      ),
    });
    const saved = await this.listings.save(listing);
    return this.findOne(saved.id);
  }

  async browse(filters: BrowseFilters = {}) {
    const qb = this.listings
      .createQueryBuilder('l')
      .leftJoinAndSelect('l.media', 'media')
      .where('l.status = :status', { status: ListingStatus.PUBLISHED });

    if (filters.type) qb.andWhere('l.type = :type', { type: filters.type });
    if (filters.city) qb.andWhere('l.city = :city', { city: filters.city });
    if (filters.verifiedOnly) {
      qb.andWhere('l.verificationTier <> :listed', {
        listed: VerificationTier.LISTED,
      });
    }

    // Verified-first, always. Rank tiers, then newest.
    qb.orderBy(
      `CASE l."verificationTier"
         WHEN 'escrow-enabled' THEN 0
         WHEN 'inspection-certified' THEN 1
         WHEN 'registry-verified' THEN 2
         WHEN 'document-verified' THEN 3
         ELSE 4 END`,
      'ASC',
    ).addOrderBy('l.createdAt', 'DESC');

    const rows = await qb.getMany();
    return rows.map((l) => serializeCard(l, this.storage));
  }

  async findOne(id: string) {
    const listing = await this.listings.findOne({
      where: { id },
      relations: { media: true, feeLines: true },
    });
    if (!listing) {
      throw new NotFoundException(`Listing ${id} not found`);
    }
    return serializeDetail(listing, this.storage);
  }
}
