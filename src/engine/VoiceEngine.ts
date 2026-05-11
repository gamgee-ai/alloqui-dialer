export interface VoiceEngine {
  init(token: string): Promise<void>;
  connect(phoneNumber: string): Promise<void>;
  disconnect(): void;
  mute(on: boolean): void;
  sendDigits(digits: string): void;
  updateToken(token: string): Promise<void>;
  destroy(): void;

  onRegistered?: () => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onRinging?: () => void;
  onError?: (error: Error) => void;
}
