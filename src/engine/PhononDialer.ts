import { CallState, CallDirection, DialerState, type PhononConfig, type CallInfo, type CallEventMap } from '../types';
import { DEFAULT_CONFIG } from '../constants';
import { EventEmitter } from './EventEmitter';
import { CallStateMachine } from './CallStateMachine';
import { TokenManager } from './TokenManager';
import type { VoiceEngine } from './VoiceEngine';

export interface DialerSnapshot {
  dialerState: DialerState;
  callState: CallState;
  call: CallInfo | null;
  muted: boolean;
  held: boolean;
  lastCall: CallInfo | null;
  lastError: Error | null;
}

export class PhononDialer extends EventEmitter<CallEventMap> {
  private stateMachine = new CallStateMachine();
  private tokenManager: TokenManager;
  private dialerState: DialerState = DialerState.Initializing;
  private muted = false;
  private held = false;
  private lastCall: CallInfo | null = null;
  private engine: VoiceEngine | null = null;
  private lastError: Error | null = null;
  private idleTransitionTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(private config: PhononConfig) {
    super();
    this.tokenManager = new TokenManager(config.projectKey, config.apiBaseUrl ?? DEFAULT_CONFIG.apiBaseUrl);
    this.tokenManager.onRefreshFailed = (error) => {
      this.dialerState = DialerState.Error;
      this.lastError = error;
      this.emit('dialer.error', { error });
      this.config.onError?.(error);
    };
    this.initialize();
  }

  getSnapshot(): DialerSnapshot {
    return {
      dialerState: this.dialerState,
      callState: this.stateMachine.state,
      call: this.stateMachine.call,
      muted: this.muted,
      held: this.held,
      lastCall: this.lastCall,
      lastError: this.lastError,
    };
  }

  async call(phoneNumber: string): Promise<CallInfo> {
    if (this.dialerState !== DialerState.Ready) throw new Error('Dialer not ready');
    if (this.stateMachine.state !== CallState.Idle) throw new Error('Call already in progress');
    if (!this.engine) throw new Error('Engine not initialized');

    const callInfo = this.stateMachine.startCall(phoneNumber, CallDirection.Outbound);
    this.emit('call.dialing', { call: callInfo });
    this.config.onCallStart?.(callInfo);

    try {
      await this.engine.connect(phoneNumber);
      return callInfo;
    } catch (error) {
      this.endCallInternal(CallState.Ended);
      throw error;
    }
  }

  hangup(): CallInfo | null {
    if (this.stateMachine.state === CallState.Idle) return null;
    this.engine?.disconnect();
    return this.endCallInternal(CallState.Ended);
  }

  toggleMute(): boolean {
    if (this.stateMachine.state !== CallState.Connected) return this.muted;
    this.muted = !this.muted;
    this.engine?.mute(this.muted);
    this.emit('call.muted', { muted: this.muted });
    return this.muted;
  }

  toggleHold(): boolean {
    if (this.stateMachine.state !== CallState.Connected) return this.held;
    this.held = !this.held;
    this.emit('call.held', { held: this.held });
    return this.held;
  }

  sendDTMF(digit: string): void {
    if (this.stateMachine.state !== CallState.Connected) return;
    this.engine?.sendDigits(digit);
  }

  redial(): Promise<CallInfo> | null {
    if (!this.lastCall) return null;
    return this.call(this.lastCall.phoneNumber);
  }

  destroy(): void {
    if (this.idleTransitionTimeout) {
      clearTimeout(this.idleTransitionTimeout);
      this.idleTransitionTimeout = null;
    }
    if (this.stateMachine.state !== CallState.Idle) this.endCallInternal(CallState.Ended);
    this.engine?.destroy();
    this.engine = null;
    this.tokenManager.destroy();
    this.removeAllListeners();
  }

  private async initialize(): Promise<void> {
    try {
      const tokenResponse = await this.tokenManager.getToken();
      const { provider } = tokenResponse;

      let engine: VoiceEngine;
      if (provider === 'twilio') {
        const { TwilioEngine } = await import('./TwilioEngine');
        engine = new TwilioEngine();
      } else if (provider === 'plivo') {
        const { PlivoEngine } = await import('./PlivoEngine');
        engine = new PlivoEngine();
      } else {
        throw new Error(`Unsupported provider: ${provider}`);
      }

      engine.onRegistered = () => {
        this.dialerState = DialerState.Ready;
        this.emit('dialer.ready');
      };

      engine.onError = (error) => {
        if (this.isCallActive()) {
          this.endCallInternal(CallState.Disconnected);
        } else {
          this.dialerState = DialerState.Error;
          this.lastError = error;
          this.emit('dialer.error', { error });
          this.config.onError?.(error);
        }
      };

      engine.onConnected = () => {
        if (this.isCallActive()) {
          const connected = this.stateMachine.transition(CallState.Connected);
          this.emit('call.connected', { call: connected });
        }
      };

      engine.onDisconnected = () => {
        if (this.isCallActive()) {
          this.endCallInternal(CallState.Ended);
        }
      };

      engine.onRinging = () => {
        if (this.isCallActive() && this.stateMachine.state === CallState.Dialing) {
          const ringing = this.stateMachine.transition(CallState.Ringing);
          this.emit('call.ringing', { call: ringing });
        }
      };

      this.engine = engine;
      await engine.init(tokenResponse.token);

      this.tokenManager.onTokenRefreshed = async (newToken) => {
        try {
          await this.engine?.updateToken(newToken);
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          this.dialerState = DialerState.Error;
          this.lastError = err;
          this.emit('dialer.error', { error: err });
          this.config.onError?.(err);
        }
      };
    } catch (error) {
      this.dialerState = DialerState.Error;
      const err = error instanceof Error ? error : new Error(String(error));
      this.lastError = err;
      this.emit('dialer.error', { error: err });
      this.config.onError?.(err);
    }
  }

  private isCallActive(): boolean {
    const s = this.stateMachine.state;
    return s !== CallState.Idle && s !== CallState.Ended && s !== CallState.Disconnected;
  }

  private endCallInternal(endState: CallState.Ended | CallState.Disconnected): CallInfo {
    const call = this.stateMachine.transition(endState);
    this.lastCall = call;
    this.muted = false;
    this.held = false;
    this.emit(endState === CallState.Ended ? 'call.ended' : 'call.disconnected', { call });
    this.config.onCallEnd?.(call);
    this.idleTransitionTimeout = setTimeout(() => {
      this.idleTransitionTimeout = null;
      this.stateMachine.transition(CallState.Idle);
    }, 100);
    return call;
  }
}
