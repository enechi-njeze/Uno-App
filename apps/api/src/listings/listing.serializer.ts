import { Listing } from './listing.entity';
import { FeeLine } from './fee-line.entity';
import { StorageProvider } from '../storage/storage-provider';
import { serializeMedia, MediaResponse } from '../media/media.serializer';

// A GeoJSON point as TypeORM returns it from a PostGIS geometry column.
interface GeoPoint {
  type: 'Point';
  coordinates: [number, number];
}

function coords(geom: object | null): { lat: number; lng: number } | null {
  const g = geom as GeoPoint | null;
  if (!g || g.type !== 'Point') return null;
  const [lng, lat] = g.coordinates;
  return { lat, lng };
}

function serializeFee(f: FeeLine) {
  return {
    id: f.id,
    kind: f.kind,
    label: f.label,
    amountNaira: f.amountNaira,
    isPercentage: f.isPercentage,
    percentageBps: f.percentageBps,
    refundable: f.refundable,
    disclosedAt: f.disclosedAt,
  };
}

// The browse card — only what the result card needs (Feature Spec §1).
export function serializeCard(l: Listing, storage: StorageProvider) {
  const media = (l.media ?? []).sort((a, b) => a.ordinal - b.ordinal);
  const hero: MediaResponse | null = media[0]
    ? serializeMedia(media[0], storage)
    : null;
  return {
    id: l.id,
    type: l.type,
    title: l.title,
    priceNaira: l.priceNaira,
    quoteBasis: l.quoteBasis,
    upfrontYears: l.upfrontYears,
    bedrooms: l.bedrooms,
    bathrooms: l.bathrooms,
    plotSizeSqm: l.plotSizeSqm,
    plotCount: l.plotCount,
    landmark: l.landmark,
    area: l.area,
    city: l.city,
    agentName: l.agentName,
    verificationTier: l.verificationTier,
    titleType: l.titleType,
    hero,
  };
}

// The full detail payload (Feature Spec §1 listing detail).
export function serializeDetail(l: Listing, storage: StorageProvider) {
  const media = (l.media ?? [])
    .sort((a, b) => a.ordinal - b.ordinal)
    .map((m) => serializeMedia(m, storage));
  const fees = (l.feeLines ?? []).map(serializeFee);
  return {
    id: l.id,
    type: l.type,
    status: l.status,
    title: l.title,
    description: l.description,
    agentName: l.agentName,
    landmark: l.landmark,
    area: l.area,
    city: l.city,
    location: coords(l.geom),
    priceNaira: l.priceNaira,
    quoteBasis: l.quoteBasis,
    upfrontYears: l.upfrontYears,
    bedrooms: l.bedrooms,
    bathrooms: l.bathrooms,
    internalAreaSqm: l.internalAreaSqm,
    plotSizeSqm: l.plotSizeSqm,
    plotCount: l.plotCount,
    yearBuilt: l.yearBuilt,
    condition: l.condition,
    verificationTier: l.verificationTier,
    titleType: l.titleType,
    verifyingFirmName: l.verifyingFirmName,
    verifyingSolicitorName: l.verifyingSolicitorName,
    verificationCheckedAt: l.verificationCheckedAt,
    verificationScopeStatement: l.verificationScopeStatement,
    acquisitionZoneResult: l.acquisitionZoneResult,
    media,
    feeLines: fees,
    createdAt: l.createdAt,
  };
}
