import { Inject, Injectable, Logger } from '@nestjs/common';
import sharp from 'sharp';
import phash from 'sharp-phash';
import { randomUUID } from 'crypto';
import { STORAGE_PROVIDER, StorageProvider } from '../storage/storage-provider';
import { MediaDerivative } from '../listings/listing-media.entity';

// Turns one uploaded image into the low-data asset set Unö serves: multi-size
// WebP + AVIF derivatives, plus a perceptual hash for the Step-8 stolen-photo
// check. Never serve the original to a phone — the derivatives are what the
// client loads (Tech Spec §"low-data mode").
const WIDTHS = [320, 800, 1200]; // thumb (card) · detail · full

export interface ProcessedImage {
  originalKey: string;
  derivatives: MediaDerivative[];
  phash: string | null;
}

@Injectable()
export class ImagePipelineService {
  private readonly logger = new Logger(ImagePipelineService.name);

  constructor(
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
  ) {}

  async process(input: Buffer, prefix = 'listings'): Promise<ProcessedImage> {
    const id = randomUUID();
    const base = `${prefix}/${id}`;

    // Keep the original (behind storage; not served to phones).
    const meta = await sharp(input).metadata();
    const originalKey = `${base}/original.${meta.format ?? 'bin'}`;
    await this.storage.put(originalKey, input, `image/${meta.format ?? 'jpeg'}`);

    const derivatives: MediaDerivative[] = [];
    for (const width of WIDTHS) {
      // Don't upscale past the source.
      const targetW = meta.width ? Math.min(width, meta.width) : width;
      const pipeline = sharp(input).resize({ width: targetW, withoutEnlargement: true });

      const webpKey = `${base}/${width}.webp`;
      const avifKey = `${base}/${width}.avif`;
      const webpBuf = await pipeline.clone().webp({ quality: 72 }).toBuffer();
      const avifBuf = await pipeline.clone().avif({ quality: 50 }).toBuffer();
      await this.storage.put(webpKey, webpBuf, 'image/webp');
      await this.storage.put(avifKey, avifBuf, 'image/avif');
      derivatives.push({ width, webp: webpKey, avif: avifKey });
    }

    let hash: string | null = null;
    try {
      hash = await phash(input);
    } catch (e) {
      this.logger.warn(`phash failed: ${(e as Error).message}`);
    }

    return { originalKey, derivatives, phash: hash };
  }
}
