export const DEFAULT_CONFIG = {
  apiBaseUrl: import.meta.env.VITE_ALLOQUI_API_URL,
  tokenRefreshBuffer: 5 * 60 * 1000,
  maxCallDuration: 15 * 60 * 1000,
};
