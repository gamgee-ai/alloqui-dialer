import { Phone } from 'lucide-react';
import { CallState } from '../types';

interface Props {
  callState: CallState;
  muted: boolean;
  onClick: () => void;
}

export function FloatBubble({ callState, muted, onClick }: Props) {
  const isActive = [CallState.Connected, CallState.Dialing, CallState.Ringing].includes(callState);
  const pulseClass = isActive ? (muted ? 'alloqui-float-bubble--muted' : 'alloqui-float-bubble--active') : '';

  return (
    <button className={`alloqui-float-bubble ${pulseClass}`} onClick={onClick} type="button" aria-label="Open dialer">
      <Phone size={24} />
    </button>
  );
}
