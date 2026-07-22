// The StorageProvider adapter boundary (Tech Spec §"adapter boundaries").
// The product needs: store an object, produce sized derivatives, return a URL.
// Phase 1 uses a local-disk implementation; Cloudflare R2 is a drop-in swap
// (S3-compatible) at demo/deploy time without touching business logic.

export interface StorageProvider {
  /** Store raw bytes under a flat key. */
  put(key: string, data: Buffer, contentType: string): Promise<void>;
  /** Read bytes back (used by the local dev file server). */
  read(key: string): Promise<Buffer>;
  /** A URL a client can fetch. Local: an API route. R2: a signed CDN URL. */
  url(key: string): string;
  /** Content type recorded for a key, if known. */
  contentType(key: string): Promise<string | null>;
}

export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');
