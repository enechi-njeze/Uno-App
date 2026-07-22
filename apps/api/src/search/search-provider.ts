// SearchProvider adapter boundary. Autocomplete over the gazetteer must be
// typo-tolerant ("Gwarimpa" == "Gwarinpa"). The production driver is Typesense
// (Tech Spec, locked); a Postgres pg_trgm driver provides the same behaviour
// with zero extra infrastructure — used in dev and as the demo-resilient
// fallback. Postgres stays the source of truth; the index is synced from it.

export interface GazetteerSuggestion {
  id: string;
  name: string;
  kind: string;
  city: string;
  score: number;
}

export interface SearchProvider {
  /** Typo-tolerant landmark autocomplete. */
  suggestLandmarks(
    q: string,
    city?: string,
    limit?: number,
  ): Promise<GazetteerSuggestion[]>;

  /** Sync the search index from Postgres. No-op for the Postgres driver. */
  reindex(): Promise<{ indexed: number }>;

  /** Which driver is active (for /health and diagnostics). */
  readonly driver: string;
}

export const SEARCH_PROVIDER = Symbol('SEARCH_PROVIDER');
