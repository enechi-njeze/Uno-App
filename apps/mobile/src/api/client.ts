import { API_URL } from '../config';
import type {
  CreateListingInput,
  ListingCard,
  ListingDetail,
} from '../types';

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, init);
  if (!res.ok) {
    let detail = `${res.status}`;
    try {
      const body = await res.json();
      detail = Array.isArray(body.message)
        ? body.message.join(', ')
        : body.message ?? detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  return (await res.json()) as T;
}

export interface HealthResponse {
  status: string;
  service: string;
  db: string;
  timestamp: string;
}

export interface BrowseParams {
  type?: string;
  city?: string;
  verifiedOnly?: boolean;
}

export const api = {
  health: () => req<HealthResponse>('/health'),

  listings: (p: BrowseParams = {}) => {
    const q = new URLSearchParams();
    if (p.type) q.set('type', p.type);
    if (p.city) q.set('city', p.city);
    if (p.verifiedOnly) q.set('verified', 'true');
    const qs = q.toString();
    return req<ListingCard[]>(`/listings${qs ? `?${qs}` : ''}`);
  },

  listing: (id: string) => req<ListingDetail>(`/listings/${id}`),

  createListing: (input: CreateListingInput) =>
    req<ListingDetail>('/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }),

  // Upload one image (multipart). `uri` is a local file URI from the picker.
  uploadMedia: async (listingId: string, uri: string) => {
    const form = new FormData();
    const name = uri.split('/').pop() ?? 'photo.jpg';
    // React Native FormData file shape.
    form.append('image', { uri, name, type: 'image/jpeg' } as unknown as Blob);
    return req<unknown>(`/listings/${listingId}/media`, {
      method: 'POST',
      body: form,
    });
  },
};
