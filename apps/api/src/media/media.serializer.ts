import { ListingMedia } from '../listings/listing-media.entity';
import { StorageProvider } from '../storage/storage-provider';

// Shape sent to clients: storage keys expanded to URLs, hero pulled out for the
// card. The app picks AVIF then WebP, and the smallest width that fits — never
// the original.
export interface MediaResponse {
  id: string;
  ordinal: number;
  captureDate: string | null;
  sizes: { width: number; webp: string; avif: string }[];
  hero: { width: number; webp: string; avif: string } | null;
}

export function serializeMedia(
  m: ListingMedia,
  storage: StorageProvider,
): MediaResponse {
  const sizes = (m.derivatives ?? []).map((d) => ({
    width: d.width,
    webp: storage.url(d.webp),
    avif: storage.url(d.avif),
  }));
  return {
    id: m.id,
    ordinal: m.ordinal,
    captureDate: m.captureDate ? m.captureDate.toISOString() : null,
    sizes,
    hero: sizes[0] ?? null,
  };
}
