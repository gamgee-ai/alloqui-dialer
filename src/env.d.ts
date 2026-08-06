declare module '*.css';

interface ImportMetaEnv {
  /**
   * Default API endpoint baked into the bundle at build time (see .env.example).
   * Required by the library build (`vite.config.lib.ts` fails without it), but
   * optional here because `vite.config.ts` builds (dev server, `build:app`) do
   * not set it — `DEFAULT_CONFIG` falls back to `FALLBACK_API_BASE_URL`.
   */
  readonly VITE_ALLOQUI_API_URL?: string;
  readonly VITE_ALLOQUI_PROJECT_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
