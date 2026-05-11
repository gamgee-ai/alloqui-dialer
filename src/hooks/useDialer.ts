import { useEffect, useRef, useState, useCallback } from 'react';
import { PhononDialer, type DialerSnapshot } from '../engine/PhononDialer';
import { CallState, DialerState } from '../types';
import type { PhononConfig } from '../types';

const INITIAL_SNAPSHOT: DialerSnapshot = {
  dialerState: DialerState.Initializing,
  callState: CallState.Idle,
  call: null,
  muted: false,
  held: false,
  lastCall: null,
  lastError: null,
};

export function useDialer(config: PhononConfig) {
  const dialerRef = useRef<PhononDialer | null>(null);
  const callbacksRef = useRef(config);
  useEffect(() => {
    callbacksRef.current = config;
  });

  const [snapshot, setSnapshot] = useState<DialerSnapshot>(INITIAL_SNAPSHOT);

  useEffect(() => {
    const stableConfig: PhononConfig = {
      projectKey: config.projectKey,
      apiBaseUrl: config.apiBaseUrl,
      onCallStart: (...args) => callbacksRef.current.onCallStart?.(...args),
      onCallEnd: (...args) => callbacksRef.current.onCallEnd?.(...args),
      onError: (...args) => callbacksRef.current.onError?.(...args),
    };

    const dialer = new PhononDialer(stableConfig);
    dialerRef.current = dialer;

    const update = () => setSnapshot(dialer.getSnapshot());

    const unsubs = [
      dialer.on('dialer.ready', update), dialer.on('dialer.error', update),
      dialer.on('call.dialing', update), dialer.on('call.ringing', update),
      dialer.on('call.connected', update), dialer.on('call.ended', update),
      dialer.on('call.disconnected', update), dialer.on('call.muted', update),
      dialer.on('call.held', update), dialer.on('call.error', update),
    ];
    update();

    return () => {
      unsubs.forEach((u) => u());
      dialer.destroy();
      dialerRef.current = null;
    };
  }, [config.projectKey, config.apiBaseUrl]);

  return {
    ...snapshot,
    makeCall: useCallback((num: string) => {
      if (!dialerRef.current) return Promise.reject(new Error('Dialer not initialized'));
      return dialerRef.current.call(num);
    }, []),
    hangup: useCallback(() => dialerRef.current?.hangup(), []),
    toggleMute: useCallback(() => dialerRef.current?.toggleMute(), []),
    toggleHold: useCallback(() => dialerRef.current?.toggleHold(), []),
    sendDTMF: useCallback((d: string) => dialerRef.current?.sendDTMF(d), []),
    redial: useCallback(() => dialerRef.current?.redial(), []),
  };
}
