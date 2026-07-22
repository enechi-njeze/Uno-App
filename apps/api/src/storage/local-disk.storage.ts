import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import { StorageProvider } from './storage-provider';

// Local-disk implementation of StorageProvider for Phase 1 development and the
// demo. Files live under MEDIA_DIR (default apps/api/.media, gitignored) and are
// served back by MediaController. Swapping to R2 means implementing the same
// interface against the S3 API — nothing else changes.
@Injectable()
export class LocalDiskStorage implements StorageProvider {
  private readonly logger = new Logger(LocalDiskStorage.name);
  private readonly baseDir: string;
  private readonly publicBase: string;

  constructor(private readonly config: ConfigService) {
    this.baseDir =
      this.config.get<string>('MEDIA_DIR') ?? join(process.cwd(), '.media');
    // Media URLs must point at wherever the API is actually reachable. On
    // Render, RENDER_EXTERNAL_URL is injected automatically, so the deployed
    // instance builds correct absolute URLs with no manual config.
    const renderUrl = process.env.RENDER_EXTERNAL_URL;
    this.publicBase =
      this.config.get<string>('PUBLIC_BASE_URL') ??
      (renderUrl ? `${renderUrl}/api/v1` : 'http://localhost:3000/api/v1');
  }

  private pathFor(key: string): string {
    // Keys are flat, but guard against traversal regardless.
    const safe = key.replace(/\.\.(\/|\\|$)/g, '');
    return join(this.baseDir, safe);
  }

  async put(key: string, data: Buffer, contentType: string): Promise<void> {
    const path = this.pathFor(key);
    await fs.mkdir(dirname(path), { recursive: true });
    await fs.writeFile(path, data);
    await fs.writeFile(`${path}.meta`, contentType, 'utf8');
  }

  async read(key: string): Promise<Buffer> {
    return fs.readFile(this.pathFor(key));
  }

  async contentType(key: string): Promise<string | null> {
    try {
      return (await fs.readFile(`${this.pathFor(key)}.meta`, 'utf8')).trim();
    } catch {
      return null;
    }
  }

  url(key: string): string {
    return `${this.publicBase}/media/${key}`;
  }
}
