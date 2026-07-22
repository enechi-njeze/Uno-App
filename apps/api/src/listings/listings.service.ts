import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Listing } from './listing.entity';
import { FeeLine } from './fee-line.entity';
import { GazetteerEntry } from '../gazetteer/gazetteer-entry.entity';
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

export interface NearFilters extends BrowseFilters {
  gazetteerId?: string;
  lat?: number;
  lng?: number;
  radiusM?: number;
}

// Verified-first ordering, reused across browse and search.
const TIER_ORDER = `CASE l."verificationTier"
   WHEN 'escrow-enabled' THEN 0
   WHEN 'inspection-certified' THEN 1
   WHEN 'registry-verified' THEN 2
   WHEN 'document-verified' THEN 3
   ELSE 4 END`;

interface GeoPoint {
  type: 'Point';
  coordinates: [number, number];
}

@Injectable()
export class ListingsService {
  constructor(
    @InjectRepository(Listing)
    private readonly listings: Repository<Listing>,
    @InjectRepository(FeeLine)
    private readonly feeLines: Repository<FeeLine>,
    @InjectRepository(GazetteerEntry)
    private readonly gazetteers: Repository<GazetteerEntry>,
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
  ) {}

  async create(dto: CreateListingDto) {
    // If the listing is tied to a gazetteer entry and no explicit point was
    // given, inherit the landmark's location so it's searchable immediately.
    let geom: object | null =
      dto.lat != null && dto.lng != null
        ? { type: 'Point', coordinates: [dto.lng, dto.lat] }
        : null;
    let city = dto.city ?? 'Abuja';
    if (dto.gazetteerId) {
      const g = await this.gazetteers.findOne({ where: { id: dto.gazetteerId } });
      if (g) {
        city = dto.city ?? g.city;
        if (!geom && g.geom) geom = g.geom;
      }
    }

    const listing = this.listings.create({
      type: dto.type,
      status: ListingStatus.PUBLISHED,
      title: dto.title,
      description: dto.description ?? null,
      agentName: dto.agentName ?? null,
      gazetteerId: dto.gazetteerId ?? null,
      landmark: dto.landmark,
      area: dto.area,
      city,
      geom,
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
    qb.orderBy(TIER_ORDER, 'ASC').addOrderBy('l.createdAt', 'DESC');

    const rows = await qb.getMany();
    return rows.map((l) => serializeCard(l, this.storage));
  }

  // Landmark search: results near a chosen gazetteer entry (or explicit point),
  // within a radius, still verified-first, then nearest. Address-second by
  // design — the entry point is a landmark, not a street.
  async searchNear(params: NearFilters) {
    let center: { lat: number; lng: number } | null = null;
    if (params.gazetteerId) {
      const g = await this.gazetteers.findOne({
        where: { id: params.gazetteerId },
      });
      const geom = g?.geom as GeoPoint | null;
      if (geom?.type === 'Point') {
        center = { lng: geom.coordinates[0], lat: geom.coordinates[1] };
      }
    } else if (params.lat != null && params.lng != null) {
      center = { lat: params.lat, lng: params.lng };
    }

    const qb = this.listings
      .createQueryBuilder('l')
      .leftJoinAndSelect('l.media', 'media')
      .where('l.status = :status', { status: ListingStatus.PUBLISHED });

    if (params.type) qb.andWhere('l.type = :type', { type: params.type });
    if (params.city) qb.andWhere('l.city = :city', { city: params.city });
    if (params.verifiedOnly) {
      qb.andWhere('l."verificationTier" <> :listed', {
        listed: VerificationTier.LISTED,
      });
    }

    if (center) {
      const radius = params.radiusM ?? 5000;
      qb.andWhere(
        `l.geom IS NOT NULL AND ST_DWithin(
           l.geom::geography,
           ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
           :radius)`,
        { lng: center.lng, lat: center.lat, radius },
      );
      qb.orderBy(TIER_ORDER, 'ASC').addOrderBy(
        `ST_Distance(l.geom::geography, ST_SetSRID(ST_MakePoint(${center.lng}, ${center.lat}), 4326)::geography)`,
        'ASC',
      );
    } else {
      qb.orderBy(TIER_ORDER, 'ASC').addOrderBy('l.createdAt', 'DESC');
    }

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
