import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Client } from 'typesense';
import {
  GazetteerSuggestion,
  SearchProvider,
} from './search-provider';

// Production search driver (Tech Spec: locked). Typo tolerance is native to
// Typesense. The index is synced from Postgres by reindex(); Postgres remains
// the source of truth. Selected when SEARCH_DRIVER=typesense and the
// TYPESENSE_* env vars are set (e.g. in the deployed environment). It is not
// exercised in the local sandbox — its server isn't reachable there — so dev
// defaults to the Postgres driver.
const COLLECTION = 'gazetteer';

@Injectable()
export class TypesenseSearchProvider implements SearchProvider {
  readonly driver = 'typesense';
  private readonly logger = new Logger(TypesenseSearchProvider.name);
  private readonly client: Client;

  constructor(
    config: ConfigService,
    @InjectDataSource() private readonly ds: DataSource,
  ) {
    this.client = new Client({
      nodes: [
        {
          host: config.get<string>('TYPESENSE_HOST') ?? 'localhost',
          port: Number(config.get<string>('TYPESENSE_PORT') ?? 8108),
          protocol: config.get<string>('TYPESENSE_PROTOCOL') ?? 'http',
        },
      ],
      apiKey: config.get<string>('TYPESENSE_API_KEY') ?? '',
      connectionTimeoutSeconds: 5,
    });
  }

  async suggestLandmarks(
    q: string,
    city?: string,
    limit = 8,
  ): Promise<GazetteerSuggestion[]> {
    const term = q.trim();
    if (!term) return [];
    const res = await this.client
      .collections(COLLECTION)
      .documents()
      .search({
        q: term,
        query_by: 'name,aliases',
        per_page: limit,
        filter_by: city ? `city:=${city}` : undefined,
        num_typos: 2,
      });
    return (res.hits ?? []).map((h) => {
      const doc = h.document as {
        id: string;
        name: string;
        kind: string;
        city: string;
      };
      return {
        id: doc.id,
        name: doc.name,
        kind: doc.kind,
        city: doc.city,
        score: typeof h.text_match === 'number' ? h.text_match : 0,
      };
    });
  }

  async reindex(): Promise<{ indexed: number }> {
    try {
      await this.client.collections(COLLECTION).retrieve();
    } catch {
      await this.client.collections().create({
        name: COLLECTION,
        fields: [
          { name: 'name', type: 'string' },
          { name: 'aliases', type: 'string[]', optional: true },
          { name: 'kind', type: 'string', facet: true },
          { name: 'city', type: 'string', facet: true },
        ],
      });
    }
    const rows: Array<{
      id: string;
      name: string;
      aliases: string[];
      kind: string;
      city: string;
    }> = await this.ds.query(
      `SELECT id, name, aliases, kind::text AS kind, city FROM gazetteer_entry`,
    );
    if (rows.length > 0) {
      await this.client
        .collections(COLLECTION)
        .documents()
        .import(
          rows.map((r) => ({ ...r, aliases: r.aliases ?? [] })),
          { action: 'upsert' },
        );
    }
    this.logger.log(`Reindexed ${rows.length} gazetteer entries into Typesense`);
    return { indexed: rows.length };
  }
}
