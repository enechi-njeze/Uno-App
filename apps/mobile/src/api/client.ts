import { API_URL } from '../config';
import type { Listing } from '../types';

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

export interface HealthResponse {
  status: string;
  service: string;
  db: string;
  timestamp: string;
}

export const api = {
  health: () => getJson<HealthResponse>('/health'),
  listings: () => getJson<Listing[]>('/listings'),
  listing: (id: string) => getJson<Listing>(`/listings/${id}`),
};
