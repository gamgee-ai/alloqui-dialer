import type { VoiceEngine } from './VoiceEngine';

interface PlivoClient {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: string, handler: (...args: any[]) => void): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  off(event: string, handler: (...args: any[]) => void): void;
  login(username: string, password: string): void;
  logout(): void;
  call(dest: string, extraHeaders?: Record<string, string>): void;
  hangup(): void;
  mute(): void;
  unmute(): void;
  sendDtmf(digits: string): void;
}

export class PlivoEngine implements VoiceEngine {
  private plivoClient: PlivoClient | null = null;

  onRegistered?: () => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onRinging?: () => void;
  onError?: (error: Error) => void;

  async init(token: string): Promise<void> {
    const plivoModule = await import('plivo-browser-sdk');
    const Plivo = plivoModule.default ?? plivoModule;

    const { username, password } = JSON.parse(token);

    const plivoInstance = new Plivo({
      debug: 'OFF',
      permOnClick: true,
      enableTracking: true,
    });

    const client: PlivoClient = plivoInstance.client;

    client.on('onCallRemoteRinging', () => {
      this.onRinging?.();
    });

    client.on('onCallAnswered', () => {
      this.onConnected?.();
    });

    client.on('onCallTerminated', () => {
      this.onDisconnected?.();
    });

    client.on('onCallFailed', (cause: string) => {
      this.onError?.(new Error(`Call failed: ${cause}`));
    });

    await Promise.race([
      new Promise<void>((resolve, reject) => {
        client.on('onLogin', () => {
          this.onRegistered?.();
          resolve();
        });

        client.on('onLoginFailed', (cause: string) => {
          reject(new Error(`Plivo login failed: ${cause}`));
        });

        client.login(username, password);
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Plivo login timed out after 15s')), 15_000)
      ),
    ]);

    this.plivoClient = client;
  }

  async connect(phoneNumber: string): Promise<void> {
    if (!this.plivoClient) throw new Error('Client not initialized');
    this.plivoClient.call(phoneNumber);
  }

  disconnect(): void {
    this.plivoClient?.hangup();
  }

  mute(on: boolean): void {
    if (on) this.plivoClient?.mute();
    else this.plivoClient?.unmute();
  }

  sendDigits(digits: string): void {
    this.plivoClient?.sendDtmf(digits);
  }

  async updateToken(token: string): Promise<void> {
    const client = this.plivoClient;
    if (!client) throw new Error('Cannot update token: Plivo client not initialized');

    const { username, password } = JSON.parse(token);

    return new Promise<void>((resolve, reject) => {
      const onLogin = () => {
        client.off('onLogin', onLogin);
        client.off('onLoginFailed', onFail);
        this.onRegistered?.();
        resolve();
      };
      const onFail = (cause: string) => {
        client.off('onLogin', onLogin);
        client.off('onLoginFailed', onFail);
        reject(new Error(`Plivo re-login failed: ${cause}`));
      };

      client.on('onLogin', onLogin);
      client.on('onLoginFailed', onFail);
      client.logout();
      client.login(username, password);
    });
  }

  destroy(): void {
    this.plivoClient?.logout();
    this.plivoClient = null;
  }
}
