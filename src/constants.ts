/**
 * Production API endpoint. Used when neither the consumer's `apiBaseUrl` nor a
 * build-time `VITE_ALLOQUI_API_URL` is set, so a bundle built outside the lib
 * build (which requires the env var) still points somewhere valid.
 */
export const FALLBACK_API_BASE_URL = 'https://api.alloqui.dev';

export const DEFAULT_CONFIG = {
  apiBaseUrl: import.meta.env.VITE_ALLOQUI_API_URL || FALLBACK_API_BASE_URL,
  tokenRefreshBuffer: 5 * 60 * 1000,
  maxCallDuration: 15 * 60 * 1000,
};
