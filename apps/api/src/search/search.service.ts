import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  GazetteerSuggestion,
  SEARCH_PROVIDER,
  SearchProvider,
} from './search-provider';

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    @Inject(SEARCH_PROVIDER) private readonly provider: SearchProvider,
  ) {}

  // Sync the index from Postgres on boot (no-op for the Postgres driver).
  async onModuleInit() {
    try {
      const { indexed } = await this.provider.reindex();
      this.logger.log(`search driver=${this.provider.driver}, indexed=${indexed}`);
    } catch (e) {
      this.logger.warn(
        `search reindex skipped (${this.provider.driver}): ${(e as Error).message}`,
      );
    }
  }

  suggest(q: string, city?: string, limit?: number): Promise<GazetteerSuggestion[]> {
    return this.provider.suggestLandmarks(q, city, limit);
  }

  get driver(): string {
    return this.provider.driver;
  }
}
