declare module '*.css';

interface ImportMetaEnv {
  /** Default API endpoint baked into the bundle at build time (see .env.example). */
  readonly VITE_ALLOQUI_API_URL: string;
  readonly VITE_ALLOQUI_PROJECT_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
