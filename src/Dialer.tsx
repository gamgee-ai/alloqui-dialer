import { Toaster } from 'sonner';
import { DialerState, type CallInfo, type DialerTheme, type FloatPosition } from './types';
import { useDialer } from './hooks/useDialer';
import { DialPadContainer } from './containers/DialPadContainer';
import { CallToastContainer } from './containers/CallToastContainer';
import { FloatContainer } from './containers/FloatContainer';

export interface DialerProps {
  projectKey: string;
  apiBaseUrl?: string;
  mode?: 'float' | 'panel';
  position?: FloatPosition;
  theme?: DialerTheme;
  contacts?: Record<string, string>;
  onCallStart?: (call: CallInfo) => void;
  onCallEnd?: (call: CallInfo) => void;
  onError?: (error: Error) => void;
}

export function Dialer({
  projectKey,
  apiBaseUrl,
  mode = 'float',
  position = 'bottom-right',
  theme = 'auto',
  contacts,
  onCallStart,
  onCallEnd,
  onError,
}: DialerProps) {
  const dialer = useDialer({ projectKey, apiBaseUrl, onCallStart, onCallEnd, onError });
  const sonnerTheme = theme === 'auto' ? undefined : theme;

  const panel = (
    <div className="phonon-dialer" data-phonon-theme={theme}>
      <div className="phonon-header">
        <span className="phonon-logo">phonon</span>
        <div className="phonon-status">
          <div className={`phonon-status-dot ${dialer.dialerState === DialerState.Error ? 'phonon-status-dot--error' : ''}`} />
          <span className="phonon-status-text">
            {dialer.dialerState === DialerState.Ready ? 'Ready' : dialer.dialerState === DialerState.Initializing ? 'Connecting...' : 'Error'}
          </span>
        </div>
      </div>
      <DialPadContainer callState={dialer.callState} makeCall={dialer.makeCall} sendDTMF={dialer.sendDTMF} />
    </div>
  );

  const toasts = (
    <>
      <CallToastContainer
        callState={dialer.callState} call={dialer.call} lastCall={dialer.lastCall}
        muted={dialer.muted} held={dialer.held} contacts={contacts}
        onToggleMute={dialer.toggleMute} onToggleHold={dialer.toggleHold}
        onHangup={dialer.hangup} onRedial={dialer.redial}
      />
      <Toaster id="phonon-dialer" theme={sonnerTheme} position="top-center" />
    </>
  );

  if (mode === 'float') {
    return (
      <>
        <FloatContainer position={position} callState={dialer.callState} muted={dialer.muted}>
          {panel}
        </FloatContainer>
        {toasts}
      </>
    );
  }

  return <>{panel}{toasts}</>;
}
