import 'reflect-metadata';
import sharp from 'sharp';
import { DataSource } from 'typeorm';
import dataSource from './data-source';
import { Listing } from '../listings/listing.entity';
import { ListingMedia } from '../listings/listing-media.entity';
import { FeeLine } from '../listings/fee-line.entity';
import {
  FeeKind,
  ListingType,
  QuoteBasis,
  TitleType,
  VerificationTier,
} from '../listings/listing.enums';
import {
  GazetteerEntry,
  GazetteerKind,
} from '../gazetteer/gazetteer-entry.entity';
import { LocalDiskStorage } from '../storage/local-disk.storage';
import { ImagePipelineService } from '../media/image-pipeline.service';

// Seed data is a Phase-1 feature, not a chore (Tech Spec §"build for the demo").
// Generates original branded placeholder images and runs them through the real
// derivative + phash pipeline so the demo exercises the whole path offline.

const storage = new LocalDiskStorage({
  get: (k: string) => process.env[k],
} as any);
const pipeline = new ImagePipelineService(storage);

const GRADIENTS: [string, string][] = [
  ['#0B3D2E', '#12704F'],
  ['#1F4E5F', '#2E86AB'],
  ['#5B3A29', '#8A5A44'],
  ['#3B2E5A', '#6C5B9E'],
  ['#4A4A2E', '#7A7A44'],
  ['#2E3B4A', '#44607A'],
];

function xml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function makeImage(title: string, subtitle: string, i: number): Promise<Buffer> {
  const [a, b] = GRADIENTS[i % GRADIENTS.length];
  const w = 1600;
  const h = 1067;
  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${a}"/><stop offset="100%" stop-color="${b}"/>
    </linearGradient></defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/>
    <text x="80" y="${h - 180}" font-family="Helvetica, Arial, sans-serif" font-size="88" font-weight="800" fill="#ffffff">Unö</text>
    <text x="80" y="${h - 90}" font-family="Helvetica, Arial, sans-serif" font-size="52" font-weight="700" fill="#ffffff" opacity="0.95">${xml(title)}</text>
    <text x="80" y="${h - 36}" font-family="Helvetica, Arial, sans-serif" font-size="34" fill="#ffffff" opacity="0.8">${xml(subtitle)}</text>
  </svg>`;
  return sharp(Buffer.from(svg)).jpeg({ quality: 82 }).toBuffer();
}

// Hand-curated gazetteer for Abuja + Lagos. Aliases carry the common
// misspellings ("Gwarinpa" / "Gwarimpa") that make typo-tolerant search matter.
interface GazSpec {
  name: string;
  aliases: string[];
  kind: GazetteerKind;
  city: string;
  lat: number;
  lng: number;
}

const GAZETTEER: GazSpec[] = [
  // Abuja
  { name: 'Jabi', aliases: ['Jabhi'], kind: GazetteerKind.DISTRICT, city: 'Abuja', lat: 9.0765, lng: 7.4165 },
  { name: 'Gwarinpa', aliases: ['Gwarimpa', 'Gwarinpa Estate'], kind: GazetteerKind.ESTATE, city: 'Abuja', lat: 9.11, lng: 7.40 },
  { name: 'Wuse 2', aliases: ['Wuse II', 'Wuse Two'], kind: GazetteerKind.DISTRICT, city: 'Abuja', lat: 9.079, lng: 7.485 },
  { name: 'Maitama', aliases: ['Maytama'], kind: GazetteerKind.DISTRICT, city: 'Abuja', lat: 9.087, lng: 7.49 },
  { name: 'Asokoro', aliases: ['Asoroko'], kind: GazetteerKind.DISTRICT, city: 'Abuja', lat: 9.04, lng: 7.53 },
  { name: 'Garki', aliases: [], kind: GazetteerKind.DISTRICT, city: 'Abuja', lat: 9.03, lng: 7.49 },
  { name: 'Kaura', aliases: ['Kaura District'], kind: GazetteerKind.DISTRICT, city: 'Abuja', lat: 8.99, lng: 7.47 },
  { name: 'Lugbe', aliases: ['Lugbe District'], kind: GazetteerKind.DISTRICT, city: 'Abuja', lat: 8.98, lng: 7.38 },
  { name: 'Shoprite Jabi', aliases: ['Jabi Lake Mall'], kind: GazetteerKind.LANDMARK, city: 'Abuja', lat: 9.077, lng: 7.417 },
  // Lagos
  { name: 'Lekki Phase 1', aliases: ['Lekki Phase One', 'Lekki Ph1'], kind: GazetteerKind.DISTRICT, city: 'Lagos', lat: 6.44, lng: 3.47 },
  { name: 'Ikota', aliases: ['Ikota GRA'], kind: GazetteerKind.ESTATE, city: 'Lagos', lat: 6.45, lng: 3.55 },
  { name: 'Victoria Island', aliases: ['VI'], kind: GazetteerKind.DISTRICT, city: 'Lagos', lat: 6.43, lng: 3.42 },
  { name: 'Ikeja', aliases: ['Ikeja GRA'], kind: GazetteerKind.DISTRICT, city: 'Lagos', lat: 6.60, lng: 3.35 },
  { name: 'Yaba', aliases: ['Yabba'], kind: GazetteerKind.DISTRICT, city: 'Lagos', lat: 6.51, lng: 3.37 },
  { name: 'Ajah', aliases: ['Aja'], kind: GazetteerKind.DISTRICT, city: 'Lagos', lat: 6.47, lng: 3.57 },
  { name: 'Surulere', aliases: ['Surelere'], kind: GazetteerKind.DISTRICT, city: 'Lagos', lat: 6.49, lng: 3.35 },
];

interface Spec {
  type: ListingType;
  title: string;
  description: string;
  agentName: string;
  landmark: string;
  area: string;
  city: string;
  lat: number;
  lng: number;
  priceNaira: string;
  quoteBasis: QuoteBasis;
  upfrontYears: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  plotSizeSqm: string | null;
  plotCount: string | null;
  titleType: TitleType;
  tier: VerificationTier;
  verifyingFirmName: string | null;
  verifyingSolicitorName: string | null;
  fees: Array<Partial<FeeLine> & { kind: FeeKind; amountNaira: string }>;
}

const SPECS: Spec[] = [
  {
    type: ListingType.RENT,
    title: '3-Bedroom Serviced Apartment',
    description: 'Serviced flat with 24/7 power and treated water, behind Shoprite Jabi.',
    agentName: 'J.U. Uzor & Associates',
    landmark: 'Behind Shoprite, Jabi', area: 'Jabi', city: 'Abuja',
    lat: 9.0765, lng: 7.4165,
    priceNaira: '4500000', quoteBasis: QuoteBasis.PER_ANNUM, upfrontYears: 1,
    bedrooms: 3, bathrooms: 3, plotSizeSqm: null, plotCount: null,
    titleType: TitleType.C_OF_O, tier: VerificationTier.REGISTRY_VERIFIED,
    verifyingFirmName: 'J.U. Uzor & Associates', verifyingSolicitorName: 'B. Okafor',
    fees: [
      { kind: FeeKind.AGENCY_COMMISSION, amountNaira: '450000', isPercentage: true, percentageBps: 1000 },
      { kind: FeeKind.CAUTION_DEPOSIT, amountNaira: '450000', refundable: true },
      { kind: FeeKind.LEGAL_FEE, amountNaira: '225000' },
      { kind: FeeKind.PLATFORM_FEE, amountNaira: '25000' },
    ],
  },
  {
    type: ListingType.BUY,
    title: '4-Bedroom Detached Duplex',
    description: 'Newly built duplex in a gated estate, all rooms ensuite.',
    agentName: 'J.U. Uzor & Associates',
    landmark: 'Near Games Village, Kaura', area: 'Kaura', city: 'Abuja',
    lat: 9.0, lng: 7.47,
    priceNaira: '185000000', quoteBasis: QuoteBasis.TOTAL, upfrontYears: null,
    bedrooms: 4, bathrooms: 5, plotSizeSqm: '650', plotCount: '1',
    titleType: TitleType.C_OF_O, tier: VerificationTier.INSPECTION_CERTIFIED,
    verifyingFirmName: 'J.U. Uzor & Associates', verifyingSolicitorName: 'A. Mensah',
    fees: [
      { kind: FeeKind.AGENCY_COMMISSION, amountNaira: '9250000', isPercentage: true, percentageBps: 500 },
      { kind: FeeKind.LEGAL_FEE, amountNaira: '9250000', isPercentage: true, percentageBps: 500 },
      { kind: FeeKind.SURVEY_FEE, amountNaira: '350000' },
      { kind: FeeKind.STAMP_DUTY, amountNaira: '2775000' },
      { kind: FeeKind.PLATFORM_FEE, amountNaira: '150000' },
    ],
  },
  {
    type: ListingType.LAND,
    title: '600sqm Residential Plot',
    description: 'Dry land in a developing district. Survey available.',
    agentName: 'Greenfield Realty',
    landmark: 'Opposite Novare Mall, Lugbe', area: 'Lugbe', city: 'Abuja',
    lat: 8.98, lng: 7.38,
    priceNaira: '25000000', quoteBasis: QuoteBasis.TOTAL, upfrontYears: null,
    bedrooms: null, bathrooms: null, plotSizeSqm: '600', plotCount: '1',
    titleType: TitleType.DEED_OF_ASSIGNMENT, tier: VerificationTier.DOCUMENT_VERIFIED,
    verifyingFirmName: 'Greenfield Realty', verifyingSolicitorName: null,
    fees: [
      { kind: FeeKind.AGENCY_COMMISSION, amountNaira: '1250000', isPercentage: true, percentageBps: 500 },
      { kind: FeeKind.SURVEY_FEE, amountNaira: '300000' },
      { kind: FeeKind.GOVERNORS_CONSENT_FEE, amountNaira: '1875000' },
      { kind: FeeKind.PLATFORM_FEE, amountNaira: '50000' },
    ],
  },
  {
    type: ListingType.SHORT_LET,
    title: '2-Bedroom Short-let, Lekki Phase 1',
    description: 'Fully furnished, WiFi and inverter backup. Nightly bookings.',
    agentName: 'Coastline Homes',
    landmark: 'Off Admiralty Way, Lekki Phase 1', area: 'Lekki Phase 1', city: 'Lagos',
    lat: 6.44, lng: 3.47,
    priceNaira: '9500000', quoteBasis: QuoteBasis.PER_ANNUM, upfrontYears: 1,
    bedrooms: 2, bathrooms: 2, plotSizeSqm: null, plotCount: null,
    titleType: TitleType.GOVERNORS_CONSENT, tier: VerificationTier.LISTED,
    verifyingFirmName: null, verifyingSolicitorName: null,
    fees: [
      { kind: FeeKind.AGENCY_COMMISSION, amountNaira: '950000', isPercentage: true, percentageBps: 1000 },
      { kind: FeeKind.CAUTION_DEPOSIT, amountNaira: '500000', refundable: true },
      { kind: FeeKind.SERVICE_CHARGE, amountNaira: '600000' },
      { kind: FeeKind.PLATFORM_FEE, amountNaira: '30000' },
    ],
  },
  {
    type: ListingType.OFF_PLAN,
    title: 'Off-plan 1-Bed in Gated Estate',
    description: 'Installment plan available. Delivery in 18 months.',
    agentName: 'Buildwell Developments',
    landmark: 'Near Ikota Shopping Complex, Ikota', area: 'Ikota', city: 'Lagos',
    lat: 6.45, lng: 3.55,
    priceNaira: '38000000', quoteBasis: QuoteBasis.TOTAL, upfrontYears: null,
    bedrooms: 1, bathrooms: 1, plotSizeSqm: null, plotCount: null,
    titleType: TitleType.LETTER_OF_ALLOCATION, tier: VerificationTier.LISTED,
    verifyingFirmName: null, verifyingSolicitorName: null,
    fees: [
      { kind: FeeKind.LEGAL_FEE, amountNaira: '1900000', isPercentage: true, percentageBps: 500 },
      { kind: FeeKind.SURVEY_FEE, amountNaira: '250000' },
      { kind: FeeKind.PLATFORM_FEE, amountNaira: '75000' },
    ],
  },
  {
    type: ListingType.RENT,
    title: 'Mini-flat (Room & Parlour), Wuse 2',
    description: 'Compact self-contained flat close to the market.',
    agentName: 'Capital Lettings',
    landmark: 'Behind Banex Plaza, Wuse 2', area: 'Wuse 2', city: 'Abuja',
    lat: 9.08, lng: 7.48,
    priceNaira: '1800000', quoteBasis: QuoteBasis.PER_ANNUM, upfrontYears: 2,
    bedrooms: 1, bathrooms: 1, plotSizeSqm: null, plotCount: null,
    titleType: TitleType.GOVERNORS_CONSENT, tier: VerificationTier.DOCUMENT_VERIFIED,
    verifyingFirmName: 'Capital Lettings', verifyingSolicitorName: null,
    fees: [
      { kind: FeeKind.AGENCY_COMMISSION, amountNaira: '180000', isPercentage: true, percentageBps: 1000 },
      { kind: FeeKind.CAUTION_DEPOSIT, amountNaira: '180000', refundable: true },
      { kind: FeeKind.LEGAL_FEE, amountNaira: '90000' },
      { kind: FeeKind.PLATFORM_FEE, amountNaira: '15000' },
    ],
  },
];

// Reusable seeder. Works on any initialised DataSource — the CLI wrapper below
// and the optional seed-on-boot hook (SEED_ON_BOOT=true) both call it. Does not
// destroy the connection; the caller owns its lifecycle.
export async function runSeed(
  ds: DataSource,
  opts: { reset?: boolean } = {},
): Promise<void> {
  const reset = !!opts.reset;
  if (!ds.isInitialized) await ds.initialize();
  await ds.runMigrations();

  const listingRepo = ds.getRepository(Listing);
  const mediaRepo = ds.getRepository(ListingMedia);
  const feeRepo = ds.getRepository(FeeLine);
  const gazRepo = ds.getRepository(GazetteerEntry);

  if (reset) {
    await feeRepo.createQueryBuilder().delete().execute();
    await mediaRepo.createQueryBuilder().delete().execute();
    await listingRepo.createQueryBuilder().delete().execute();
    await gazRepo.createQueryBuilder().delete().execute();
    console.log('• cleared existing listings + gazetteer');
  }

  // Seed the gazetteer and index by name for linking listings.
  const gazByName = new Map<string, string>();
  if ((await gazRepo.count()) === 0) {
    for (const g of GAZETTEER) {
      const saved = await gazRepo.save(
        gazRepo.create({
          name: g.name,
          aliases: g.aliases,
          kind: g.kind,
          city: g.city,
          geom: { type: 'Point', coordinates: [g.lng, g.lat] },
        }),
      );
      gazByName.set(g.name, saved.id);
    }
    console.log(`• seeded ${GAZETTEER.length} gazetteer entries`);
  } else {
    for (const g of await gazRepo.find()) gazByName.set(g.name, g.id);
  }

  const existing = await listingRepo.count();
  if (existing > 0 && !reset) {
    console.log(`• ${existing} listings already present — skipping (use --reset to reseed)`);
    return;
  }

  let i = 0;
  for (const s of SPECS) {
    const listing = await listingRepo.save(
      listingRepo.create({
        type: s.type,
        title: s.title,
        description: s.description,
        agentName: s.agentName,
        gazetteerId: gazByName.get(s.area) ?? null,
        landmark: s.landmark,
        area: s.area,
        city: s.city,
        geom: { type: 'Point', coordinates: [s.lng, s.lat] },
        priceNaira: s.priceNaira,
        quoteBasis: s.quoteBasis,
        upfrontYears: s.upfrontYears,
        bedrooms: s.bedrooms,
        bathrooms: s.bathrooms,
        plotSizeSqm: s.plotSizeSqm,
        plotCount: s.plotCount,
        titleType: s.titleType,
        verificationTier: s.tier,
        verifyingFirmName: s.verifyingFirmName,
        verifyingSolicitorName: s.verifyingSolicitorName,
        verificationCheckedAt:
          s.tier === VerificationTier.LISTED ? null : new Date('2026-07-01'),
        verificationScopeStatement:
          s.tier === VerificationTier.REGISTRY_VERIFIED
            ? 'Registry search confirmed the title exists and is held as claimed as at the check date. Does not warrant future encumbrance or undisclosed claims.'
            : null,
        acquisitionZoneResult:
          s.tier === VerificationTier.REGISTRY_VERIFIED ? 'clear' : 'not-checked',
        feeLines: s.fees.map((f) =>
          feeRepo.create({
            kind: f.kind,
            amountNaira: f.amountNaira,
            isPercentage: f.isPercentage ?? false,
            percentageBps: f.percentageBps ?? null,
            refundable: f.refundable ?? false,
          }),
        ),
      }),
    );

    const buf = await makeImage(s.title, `${s.landmark} · ${s.city}`, i);
    const processed = await pipeline.process(buf);
    await mediaRepo.save(
      mediaRepo.create({
        listingId: listing.id,
        ordinal: 0,
        originalKey: processed.originalKey,
        derivatives: processed.derivatives,
        phash: processed.phash,
        captureDate: new Date('2026-06-15'),
      }),
    );
    console.log(`• seeded: ${s.title} [${s.tier}]`);
    i++;
  }

  console.log(`Done. ${SPECS.length} listings seeded.`);
}

// CLI entrypoint: `npm run seed` / `npm run seed:reset`.
if (require.main === module) {
  const reset = process.argv.includes('--reset');
  runSeed(dataSource, { reset })
    .then(() => dataSource.destroy())
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
