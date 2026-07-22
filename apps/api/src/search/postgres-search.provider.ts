import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  GazetteerSuggestion,
  SearchProvider,
} from './search-provider';

// pg_trgm + unaccent give typo-tolerant, accent-insensitive matching directly
// in Postgres. Good for a few hundred gazetteer entries — the realistic launch
// size — and it means the demo has no external service to fail on bad wifi.
@Injectable()
export class PostgresSearchProvider implements SearchProvider {
  readonly driver = 'postgres';

  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async suggestLandmarks(
    q: string,
    city?: string,
    limit = 8,
  ): Promise<GazetteerSuggestion[]> {
    const term = q.trim();
    if (!term) return [];
    const rows = await this.ds.query(
      `
      WITH t AS (SELECT unaccent(lower($1)) AS term)
      SELECT g.id, g.name, g.kind::text AS kind, g.city,
        GREATEST(
          similarity(unaccent(lower(g.name)), (SELECT term FROM t)),
          COALESCE((SELECT MAX(similarity(unaccent(lower(a)), (SELECT term FROM t)))
                    FROM unnest(g.aliases) a), 0)
        ) AS score
      FROM gazetteer_entry g
      WHERE ($2::text IS NULL OR g.city = $2)
        AND (
          unaccent(lower(g.name)) LIKE '%' || (SELECT term FROM t) || '%'
          OR similarity(unaccent(lower(g.name)), (SELECT term FROM t)) > 0.2
          OR EXISTS (
            SELECT 1 FROM unnest(g.aliases) a
            WHERE unaccent(lower(a)) LIKE '%' || (SELECT term FROM t) || '%'
               OR similarity(unaccent(lower(a)), (SELECT term FROM t)) > 0.2
          )
        )
      ORDER BY score DESC, g.name ASC
      LIMIT $3
      `,
      [term, city ?? null, limit],
    );
    return rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      kind: r.kind,
      city: r.city,
      score: Number(r.score),
    }));
  }

  async reindex(): Promise<{ indexed: number }> {
    // The table is the index; nothing to sync. Report the count.
    const [{ count }] = await this.ds.query(
      `SELECT count(*)::int AS count FROM gazetteer_entry`,
    );
    return { indexed: count };
  }
}
