import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { CallState, type CallInfo } from '../types';
import { CallToast } from '../components/CallToast';
import { DialingToast } from '../components/DialingToast';
import { EndedToast } from '../components/EndedToast';

interface Props {
  callState: CallState;
  call: CallInfo | null;
  lastCall: CallInfo | null;
  muted: boolean;
  held: boolean;
  contacts?: Record<string, string>;
  onToggleMute: () => void;
  onToggleHold: () => void;
  onHangup: () => void;
  onRedial: () => void;
}

export function CallToastContainer({ callState, call, lastCall, muted, held, contacts, onToggleMute, onToggleHold, onHangup, onRedial }: Props) {
  const toastId = useRef<string | number | null>(null);
  const handlersRef = useRef({ onToggleMute, onToggleHold, onHangup, onRedial, contacts });
  useEffect(() => {
    handlersRef.current = { onToggleMute, onToggleHold, onHangup, onRedial, contacts };
  });

  useEffect(() => {
    const active = call ?? lastCall;
    if (!active) return;

    if (toastId.current !== null) {
      toast.dismiss(toastId.current);
      toastId.current = null;
    }

    const name = handlersRef.current.contacts?.[active.phoneNumber] ?? null;
    const isDialing = callState === CallState.Dialing || callState === CallState.Ringing;
    const isConnected = callState === CallState.Connected;
    const isEnded = callState === CallState.Ended;
    const isDisconnected = callState === CallState.Disconnected;

    if (isDialing) {
      toastId.current = toast.custom(
        (id) => <DialingToast phoneNumber={active.phoneNumber} contactName={name} onCancel={() => { handlersRef.current.onHangup(); toast.dismiss(id); }} />,
        { duration: Infinity, toasterId: "phonon-dialer" },
      );
    } else if (isConnected) {
      toastId.current = toast.custom(
        (id) => <CallToast phoneNumber={active.phoneNumber} contactName={name} duration={active.duration} muted={muted} held={held} onToggleMute={() => handlersRef.current.onToggleMute()} onToggleHold={() => handlersRef.current.onToggleHold()} onHangup={() => { handlersRef.current.onHangup(); toast.dismiss(id); }} />,
        { duration: Infinity, toasterId: "phonon-dialer" },
      );
    } else if (isEnded || isDisconnected) {
      toastId.current = toast.custom(
        (id) => <EndedToast phoneNumber={active.phoneNumber} contactName={name} duration={active.duration} disconnected={isDisconnected} onRedial={() => { handlersRef.current.onRedial(); toast.dismiss(id); }} onClose={() => toast.dismiss(id)} />,
        { duration: 8000, toasterId: "phonon-dialer" },
      );
    }
  }, [callState, call, lastCall, muted, held]);

  return null;
}
