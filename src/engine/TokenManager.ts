import { DEFAULT_CONFIG } from '../constants';
import { fetchToken, type TokenResponse } from '../api';

export type { TokenResponse };

const MAX_REFRESH_RETRIES = 3;
const RETRY_BASE_MS = 2000;

export class TokenManager {
  private token: TokenResponse | null = null;
  private refreshTimeout: ReturnType<typeof setTimeout> | null = null;
  private fetching: Promise<TokenResponse> | null = null;
  private destroyed = false;
  onRefreshFailed?: (error: Error) => void;
  onTokenRefreshed?: (token: string) => void;

  constructor(private projectKey: string, private apiBaseUrl: string) {}

  async getToken(): Promise<TokenResponse> {
    if (this.token && !this.isExpired()) return this.token;
    if (this.fetching) return this.fetching;

    this.fetching = this.fetchAndStore();
    try { return await this.fetching; }
    finally { this.fetching = null; }
  }

  destroy(): void {
    this.destroyed = true;
    if (this.refreshTimeout) clearTimeout(this.refreshTimeout);
    this.token = null;
    this.fetching = null;
  }

  private async fetchAndStore(): Promise<TokenResponse> {
    const token = await fetchToken(this.apiBaseUrl, this.projectKey);
    this.token = token;
    this.scheduleRefresh(token);
    return token;
  }

  private scheduleRefresh(token: TokenResponse): void {
    if (this.refreshTimeout) clearTimeout(this.refreshTimeout);
    const refreshIn = Math.max(0, token.expiresAt - Date.now() - DEFAULT_CONFIG.tokenRefreshBuffer);
    this.refreshTimeout = setTimeout(() => this.refreshWithRetry(0), refreshIn);
  }

  private async refreshWithRetry(attempt: number): Promise<void> {
    if (this.destroyed) return;
    try {
      this.token = null;
      const refreshed = await this.getToken();
      this.onTokenRefreshed?.(refreshed.token);
    } catch (err) {
      if (this.destroyed) return;
      if (attempt < MAX_REFRESH_RETRIES) {
        const delay = RETRY_BASE_MS * 2 ** attempt;
        this.refreshTimeout = setTimeout(() => this.refreshWithRetry(attempt + 1), delay);
      } else {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error('[Phonon] token refresh failed after retries:', error);
        this.onRefreshFailed?.(error);
      }
    }
  }

  private isExpired(): boolean {
    return !this.token || Date.now() >= this.token.expiresAt - 30_000;
  }
}
