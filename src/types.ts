export enum CallState {
  Idle = 'idle',
  Dialing = 'dialing',
  Ringing = 'ringing',
  Connected = 'connected',
  Ended = 'ended',
  Disconnected = 'disconnected',
}

export enum CallDirection {
  Outbound = 'outbound',
  Inbound = 'inbound',
}

export enum DialerState {
  Initializing = 'initializing',
  Ready = 'ready',
  Error = 'error',
}

export type DialerTheme = 'light' | 'dark' | 'auto';
export type FloatPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

export interface AlloquiConfig {
  projectKey: string;
  apiBaseUrl?: string;
  onCallStart?: (call: CallInfo) => void;
  onCallEnd?: (call: CallInfo) => void;
  onError?: (error: Error) => void;
}

export interface CallInfo {
  id: string;
  phoneNumber: string;
  direction: CallDirection;
  state: CallState;
  startedAt: number | null;
  endedAt: number | null;
  duration: number;
}

export interface CallEventMap {
  'call.dialing': { call: CallInfo };
  'call.ringing': { call: CallInfo };
  'call.connected': { call: CallInfo };
  'call.ended': { call: CallInfo };
  'call.disconnected': { call: CallInfo };
  'call.muted': { muted: boolean };
  'call.held': { held: boolean };
  'call.error': { error: Error };
  'dialer.ready': undefined;
  'dialer.error': { error: Error };
}
