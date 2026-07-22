import Constants from 'expo-constants';

// Resolve the API base URL in priority order:
//   1. EXPO_PUBLIC_API_URL env var (per-developer / per-device override)
//   2. app.json -> expo.extra.apiUrl (committed fallback)
//   3. localhost default (works on iOS simulator / web)
//
// On a physical Android/iOS device, localhost points at the phone, not your
// laptop — set EXPO_PUBLIC_API_URL to your machine's LAN IP, e.g.
//   EXPO_PUBLIC_API_URL=http://192.168.1.20:3000/api/v1 npm run start
const extra = (Constants.expoConfig?.extra ?? {}) as { apiUrl?: string };

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  extra.apiUrl ??
  'http://localhost:3000/api/v1';
