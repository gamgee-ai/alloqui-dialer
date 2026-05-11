import { Device, Call } from '@twilio/voice-sdk';
import type { VoiceEngine } from './VoiceEngine';

export class TwilioEngine implements VoiceEngine {
  private device: Device | null = null;
  private activeCall: Call | null = null;

  onRegistered?: () => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onRinging?: () => void;
  onError?: (error: Error) => void;

  async init(token: string): Promise<void> {
    this.device = new Device(token, {
      codecPreferences: [Call.Codec.Opus, Call.Codec.PCMU],
      logLevel: 1,
    });

    this.device.on('registered', () => {
      this.onRegistered?.();
    });

    this.device.on('error', (error) => {
      const err = error instanceof Error ? error : new Error(String(error));
      this.onError?.(err);
    });

    await this.device.register();
  }

  async connect(phoneNumber: string): Promise<void> {
    if (!this.device) throw new Error('Device not initialized');
    const twilioCall = await this.device.connect({ params: { To: phoneNumber } });
    this.activeCall = twilioCall;
    this.bindCallEvents(twilioCall);
  }

  disconnect(): void {
    this.activeCall?.disconnect();
    this.activeCall = null;
  }

  mute(on: boolean): void {
    this.activeCall?.mute(on);
  }

  sendDigits(digits: string): void {
    this.activeCall?.sendDigits(digits);
  }

  async updateToken(token: string): Promise<void> {
    this.device?.updateToken(token);
  }

  destroy(): void {
    this.activeCall?.disconnect();
    this.activeCall = null;
    this.device?.destroy();
    this.device = null;
  }

  private bindCallEvents(twilioCall: Call): void {
    twilioCall.on('ringing', () => {
      this.onRinging?.();
    });

    twilioCall.on('accept', () => {
      this.onConnected?.();
    });

    twilioCall.on('disconnect', () => {
      this.activeCall = null;
      this.onDisconnected?.();
    });

    twilioCall.on('cancel', () => {
      this.activeCall = null;
      this.onDisconnected?.();
    });

    twilioCall.on('error', (error) => {
      this.activeCall = null;
      const err = error instanceof Error ? error : new Error(String(error));
      this.onError?.(err);
    });
  }
}
